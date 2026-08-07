import type { SpatialAssetDescriptor, SpatialAssetSource } from "./types";

// Private local test asset. The entire public/assets/3dgs directory is ignored
// by Git, and production keeps the existing fallback until a hosted source is configured.
export const BOGWANG_TEST_ASSET_URL = import.meta.env.DEV
  ? "assets/3dgs/3dgs20260801120730/index.sog"
  : "";

export const BOGWANG_TEST_SETTINGS_URL = import.meta.env.DEV
  ? "assets/3dgs/3dgs20260801120730/settings.json"
  : "";

const bogwangSources: SpatialAssetSource[] = [
  {
    type: "local",
    directoryName: "3dgs20260801120730",
    assetFileName: "index.sog",
    settingsFileName: "settings.json",
  },
  ...(BOGWANG_TEST_ASSET_URL.trim()
    ? [{ type: "remote" as const, url: BOGWANG_TEST_ASSET_URL.trim() }]
    : []),
];

export const assetRegistry: Record<string, SpatialAssetDescriptor> = {
  "bogwang-001-splat": {
    id: "bogwang-001-splat",
    format: "sog",
    settingsUrl: BOGWANG_TEST_SETTINGS_URL,
    sources: bogwangSources,
  },
};
