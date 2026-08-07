import type { SpatialAssetDescriptor, SpatialRecord } from "../data/records";

export type ViewerSource =
  | { kind: "demo" }
  | { kind: "configured"; descriptor: SpatialAssetDescriptor };

export type ViewerModel = {
  recordId: string;
  number: string;
  title: string;
  titleEn: string;
  source: ViewerSource;
};

export function createViewerModel(record: SpatialRecord): ViewerModel {
  return {
    recordId: record.id,
    number: record.number,
    title: record.title,
    titleEn: record.titleEn,
    source: record.asset
      ? { kind: "configured", descriptor: record.asset }
      : { kind: "demo" },
  };
}
