export type SpatialAssetId = string;

export type SpatialAssetFormat = "ply" | "sog" | "streamed-sog";

export type SpatialAssetSource =
  | { type: "remote"; url: string }
  | {
      type: "local";
      directoryName?: string;
      assetFileName?: string;
      settingsFileName?: string;
    };

export type SpatialAssetDescriptor = {
  id: SpatialAssetId;
  format: SpatialAssetFormat;
  settingsUrl?: string;
  sources: SpatialAssetSource[];
};

export type ResolvedViewerSource = {
  assetId: SpatialAssetId;
  format: SpatialAssetFormat;
  sourceType: SpatialAssetSource["type"];
  url: string;
  settingsUrl?: string;
};

export type AssetResolutionFailure =
  | "asset-unassigned"
  | "asset-not-registered"
  | "source-unavailable";

export type AssetResolution =
  | { kind: "resolved"; source: ResolvedViewerSource }
  | { kind: "unavailable"; reason: AssetResolutionFailure };
