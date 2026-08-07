import { notFound } from "next/navigation";
import { getRecord, records } from "../../data";
import ScanViewer from "./ScanViewer";

export function generateStaticParams() {
  return records.map((record) => ({ id: record.id }));
}

export default async function ViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = getRecord(id);
  if (!record) notFound();
  return <ScanViewer record={record} />;
}
