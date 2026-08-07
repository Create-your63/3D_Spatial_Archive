import { assetRegistry } from "./assetRegistry";
import type {
  ResolvedViewerSource,
  SpatialAssetId,
  SpatialAssetSource,
} from "./types";

const DATABASE_NAME = "spatial-archive-local-assets";
const STORE_NAME = "directory-handles";
const ROOT_HANDLE_KEY = "3dgs-root";

type LocalSourceConfig = Extract<SpatialAssetSource, { type: "local" }>;
type DirectoryPickerWindow = Window & {
  showDirectoryPicker?: (options?: { mode?: "read" }) => Promise<FileSystemDirectoryHandle>;
};
type PermissionCapableHandle = FileSystemDirectoryHandle & {
  queryPermission?: (options?: { mode?: "read" }) => Promise<PermissionState>;
};

export type LocalAssetConnection = {
  source: ResolvedViewerSource;
  directoryName: string;
  hasExportedSettings: boolean;
};

export type LocalAssetErrorCode =
  | "asset-not-registered"
  | "local-source-not-configured"
  | "directory-picker-unsupported"
  | "asset-file-not-found";

export class LocalAssetError extends Error {
  constructor(
    readonly code: LocalAssetErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "LocalAssetError";
  }
}

function getLocalSourceConfig(assetId: SpatialAssetId): LocalSourceConfig {
  const asset = assetRegistry[assetId];
  if (!asset) {
    throw new LocalAssetError("asset-not-registered", `등록되지 않은 asset ID: ${assetId}`);
  }

  const source = asset.sources.find(
    (candidate): candidate is LocalSourceConfig => candidate.type === "local",
  );
  if (!source) {
    throw new LocalAssetError(
      "local-source-not-configured",
      `로컬 source가 설정되지 않은 asset ID: ${assetId}`,
    );
  }
  return source;
}

function openHandleDatabase(): Promise<IDBDatabase | null> {
  if (!("indexedDB" in window)) return Promise.resolve(null);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveRootHandle(handle: FileSystemDirectoryHandle) {
  const database = await openHandleDatabase();
  if (!database) return;

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(handle, ROOT_HANDLE_KEY);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
  database.close();
}

async function readRootHandle(): Promise<FileSystemDirectoryHandle | null> {
  const database = await openHandleDatabase();
  if (!database) return null;

  const handle = await new Promise<FileSystemDirectoryHandle | null>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).get(ROOT_HANDLE_KEY);
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
  });
  database.close();
  return handle;
}

async function getChildDirectory(
  root: FileSystemDirectoryHandle,
  name: string,
): Promise<FileSystemDirectoryHandle | null> {
  try {
    return await root.getDirectoryHandle(name);
  } catch (error) {
    if (error instanceof DOMException && error.name === "NotFoundError") return null;
    throw error;
  }
}

async function locateAssetDirectory(
  root: FileSystemDirectoryHandle,
  assetId: SpatialAssetId,
  config: LocalSourceConfig,
) {
  const candidateNames = [config.directoryName, assetId].filter(
    (name): name is string => Boolean(name),
  );

  if (candidateNames.includes(root.name)) return root;
  for (const name of candidateNames) {
    const child = await getChildDirectory(root, name);
    if (child) return child;
  }
  return root;
}

async function getOptionalFile(
  directory: FileSystemDirectoryHandle,
  name: string,
): Promise<File | null> {
  try {
    return await (await directory.getFileHandle(name)).getFile();
  } catch (error) {
    if (error instanceof DOMException && error.name === "NotFoundError") return null;
    throw error;
  }
}

async function resolveFromDirectory(
  assetId: SpatialAssetId,
  root: FileSystemDirectoryHandle,
): Promise<LocalAssetConnection> {
  const asset = assetRegistry[assetId];
  const config = getLocalSourceConfig(assetId);
  const directory = await locateAssetDirectory(root, assetId, config);
  const assetFileName = config.assetFileName || `index.${asset.format === "streamed-sog" ? "sog" : asset.format}`;
  const assetFile = await getOptionalFile(directory, assetFileName);

  if (!assetFile) {
    throw new LocalAssetError(
      "asset-file-not-found",
      `${directory.name} 폴더에서 ${assetFileName} 파일을 찾지 못했습니다.`,
    );
  }

  const settingsFile = config.settingsFileName
    ? await getOptionalFile(directory, config.settingsFileName)
    : null;

  return {
    source: {
      assetId: asset.id,
      format: asset.format,
      sourceType: "local",
      url: URL.createObjectURL(assetFile),
      settingsUrl: settingsFile ? URL.createObjectURL(settingsFile) : undefined,
    },
    directoryName: directory.name,
    hasExportedSettings: Boolean(settingsFile),
  };
}

export function hasLocalAssetSource(assetId?: SpatialAssetId) {
  if (!assetId) return false;
  return assetRegistry[assetId]?.sources.some((source) => source.type === "local") ?? false;
}

export function supportsLocalDirectoryPicker() {
  const pickerWindow = window as DirectoryPickerWindow;
  return window.isSecureContext && typeof pickerWindow.showDirectoryPicker === "function";
}

export async function selectLocalViewerAsset(
  assetId: SpatialAssetId,
): Promise<LocalAssetConnection> {
  const pickerWindow = window as DirectoryPickerWindow;
  if (!supportsLocalDirectoryPicker() || !pickerWindow.showDirectoryPicker) {
    throw new LocalAssetError(
      "directory-picker-unsupported",
      "이 브라우저에서는 로컬 폴더 선택을 지원하지 않습니다.",
    );
  }

  const root = await pickerWindow.showDirectoryPicker({ mode: "read" });
  const connection = await resolveFromDirectory(assetId, root);
  await saveRootHandle(root).catch(() => undefined);
  return connection;
}

export async function restoreLocalViewerAsset(
  assetId: SpatialAssetId,
): Promise<LocalAssetConnection | null> {
  if (!supportsLocalDirectoryPicker()) return null;
  const root = await readRootHandle();
  if (!root) return null;

  const permissionHandle = root as PermissionCapableHandle;
  const permission = permissionHandle.queryPermission
    ? await permissionHandle.queryPermission({ mode: "read" })
    : "prompt";
  if (permission !== "granted") return null;

  return resolveFromDirectory(assetId, root);
}

export function revokeLocalViewerAsset(source?: ResolvedViewerSource) {
  if (source?.sourceType !== "local") return;
  URL.revokeObjectURL(source.url);
  if (source.settingsUrl) URL.revokeObjectURL(source.settingsUrl);
}
