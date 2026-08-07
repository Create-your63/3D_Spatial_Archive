import type { SpatialRecord } from "../data/records";
import { resolveViewerAsset } from "./assetResolver";
import type { AssetResolutionFailure, ResolvedViewerSource } from "./types";

export type ViewerSource =
  | { kind: "demo"; reason: AssetResolutionFailure }
  | { kind: "resolved"; value: ResolvedViewerSource };

export type ViewerModel = {
  recordId: string;
  number: string;
  title: string;
  titleEn: string;
  source: ViewerSource;
};

export function createViewerModel(
  record: SpatialRecord,
  sourceOverride?: ResolvedViewerSource,
): ViewerModel {
  const resolution = sourceOverride && sourceOverride.assetId === record.assetId
    ? { kind: "resolved" as const, source: sourceOverride }
    : resolveViewerAsset(record.assetId);

  return {
    recordId: record.id,
    number: record.number,
    title: record.title,
    titleEn: record.titleEn,
    source: resolution.kind === "resolved"
      ? { kind: "resolved", value: resolution.source }
      : { kind: "demo", reason: resolution.reason },
  };
}
