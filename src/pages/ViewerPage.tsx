import { Navigate, useParams } from "react-router-dom";
import ScanViewer from "../components/ScanViewer";
import { getRecord } from "../data/records";
import { createViewerModel } from "../viewer/viewerModel";

export default function ViewerPage() {
  const { id } = useParams<{ id: string }>();
  const record = id ? getRecord(id) : undefined;

  if (!record) return <Navigate to="/archive" replace />;

  return <ScanViewer model={createViewerModel(record)} />;
}
