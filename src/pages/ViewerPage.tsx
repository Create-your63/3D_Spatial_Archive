import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import ScanViewer from "../components/ScanViewer";
import { getRecord } from "../data/records";
import {
  hasLocalAssetSource,
  LocalAssetError,
  restoreLocalViewerAsset,
  revokeLocalViewerAsset,
  selectLocalViewerAsset,
  supportsLocalDirectoryPicker,
  type LocalAssetConnection,
} from "../viewer/localAssetSource";
import { createViewerModel } from "../viewer/viewerModel";

export default function ViewerPage() {
  const { id } = useParams<{ id: string }>();
  const record = id ? getRecord(id) : undefined;
  const assetId = record?.assetId;
  const [localConnection, setLocalConnection] = useState<LocalAssetConnection>();
  const [localStatus, setLocalStatus] = useState<"idle" | "restoring" | "selecting" | "connected" | "error">("idle");
  const [localMessage, setLocalMessage] = useState("");
  const localConnectionRef = useRef<LocalAssetConnection | undefined>(undefined);

  const replaceLocalConnection = useCallback((next?: LocalAssetConnection) => {
    revokeLocalViewerAsset(localConnectionRef.current?.source);
    localConnectionRef.current = next;
    setLocalConnection(next);
  }, []);

  useEffect(() => {
    let active = true;
    replaceLocalConnection();
    setLocalMessage("");

    if (!assetId || !hasLocalAssetSource(assetId) || !supportsLocalDirectoryPicker()) {
      setLocalStatus("idle");
      return () => { active = false; };
    }

    setLocalStatus("restoring");
    void restoreLocalViewerAsset(assetId)
      .then((connection) => {
        if (!active) {
          revokeLocalViewerAsset(connection?.source);
          return;
        }
        if (connection) {
          replaceLocalConnection(connection);
          setLocalStatus("connected");
          setLocalMessage(connection.hasExportedSettings
            ? "저장된 카메라 설정을 함께 불러왔습니다."
            : "settings.json이 없어 기본 카메라 설정을 사용합니다.");
        } else {
          setLocalStatus("idle");
        }
      })
      .catch(() => {
        if (active) setLocalStatus("idle");
      });

    return () => { active = false; };
  }, [assetId, replaceLocalConnection]);

  useEffect(() => () => {
    revokeLocalViewerAsset(localConnectionRef.current?.source);
  }, []);

  const selectLocalFolder = useCallback(async () => {
    if (!assetId) return;
    setLocalStatus("selecting");
    setLocalMessage("");

    try {
      const connection = await selectLocalViewerAsset(assetId);
      replaceLocalConnection(connection);
      setLocalStatus("connected");
      setLocalMessage(connection.hasExportedSettings
        ? "저장된 카메라 설정을 함께 불러왔습니다."
        : "settings.json이 없어 기본 카메라 설정을 사용합니다.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setLocalStatus(localConnectionRef.current ? "connected" : "idle");
        return;
      }

      setLocalStatus("error");
      setLocalMessage(error instanceof LocalAssetError
        ? error.message
        : "로컬 3DGS 폴더를 연결하지 못했습니다.");
    }
  }, [assetId, replaceLocalConnection]);

  if (!record) return <Navigate to="/archive" replace />;

  return (
    <ScanViewer
      model={createViewerModel(record, localConnection?.source)}
      localAssetControl={{
        available: Boolean(assetId && hasLocalAssetSource(assetId)),
        supported: supportsLocalDirectoryPicker(),
        status: localStatus,
        directoryName: localConnection?.directoryName,
        message: localMessage,
        onSelect: selectLocalFolder,
      }}
    />
  );
}
