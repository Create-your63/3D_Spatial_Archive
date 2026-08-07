import { assetRegistry } from "./assetRegistry";
import type { AssetResolution, SpatialAssetId } from "./types";

export function resolveViewerAsset(assetId?: SpatialAssetId): AssetResolution {
  if (!assetId) {
    return { kind: "unavailable", reason: "asset-unassigned" };
  }

  const asset = assetRegistry[assetId];
  if (!asset) {
    return { kind: "unavailable", reason: "asset-not-registered" };
  }

  const source = asset.sources.find(
    (candidate) => candidate.type === "remote" && candidate.url.trim().length > 0,
  );

  if (!source || source.type !== "remote") {
    return { kind: "unavailable", reason: "source-unavailable" };
  }

  return {
    kind: "resolved",
    source: {
      assetId: asset.id,
      format: asset.format,
      sourceType: source.type,
      url: source.url.trim(),
      settingsUrl: asset.settingsUrl?.trim() || undefined,
    },
  };
}
