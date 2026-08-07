import type { CSSProperties } from "react";
import { ArrowLeft, ArrowRight, Box, CalendarDays, Camera, MapPin, Ruler, ScanLine } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import { getRecord } from "../data/records";

export default function RecordPage() {
  const { id } = useParams<{ id: string }>();
  const record = id ? getRecord(id) : undefined;

  if (!record) return <Navigate to="/archive" replace />;

  return (
    <main className="detail-page">
      <header className="detail-header">
        <Link className="wordmark wordmark-dark" to="/"><span className="wordmark-mark" /><span>SPATIAL<br />ARCHIVE</span></Link>
        <Link className="back-link" to="/archive"><ArrowLeft size={15} /> BACK TO MAP</Link>
        <span className="detail-id">FIELD RECORD / {record.number}</span>
      </header>

      <section className="detail-hero">
        <div className="detail-title">
          <span className={`status-pill ${record.status}`}><i /> {record.statusLabel}</span>
          <h1>{record.title}</h1>
          <p>{record.titleEn}</p>
        </div>
        <div className="detail-coordinate">
          <span>{record.lat.toFixed(4)}° N</span><span>{record.lng.toFixed(4)}° E</span>
        </div>
      </section>

      <section className="detail-body">
        <div className="detail-visual" aria-label={`${record.title} 3D 기록 미리보기`}>
          <div className="detail-grid" />
          <div className="detail-cloud">
            {Array.from({ length: 48 }).map((_, index) => <i key={index} style={{ "--i": index } as CSSProperties} />)}
          </div>
          <div className="visual-caption"><ScanLine size={15} /> GAUSSIAN FIELD PREVIEW</div>
          <span className="visual-scale"><i /> 1 M</span>
        </div>

        <div className="detail-info">
          <p className="lead">{record.description}</p>
          <div className="fact-grid">
            <div><MapPin /><span>위치<strong>{record.address}</strong></span></div>
            <div><CalendarDays /><span>촬영일<strong>{record.date}</strong></span></div>
            <div><Camera /><span>촬영 장비<strong>{record.equipment}</strong></span></div>
            <div><Ruler /><span>공간 스케일<strong>1 UNIT = 1 METER</strong></span></div>
          </div>
          <div className="method-block">
            <span className="eyebrow">RECORDING METHOD</span>
            <div>{record.method.map((method) => <span key={method}>{method}</span>)}</div>
          </div>
          <div className="field-note"><span>FIELD NOTE / {record.year}</span><p>{record.note}</p></div>
          <div className="detail-actions">
            <Link className="primary-action" to={`/viewer/${record.id}`}><Box size={18} /> 3D 공간 입장 <ArrowRight size={16} /></Link>
            <button className="secondary-action" disabled>{record.vr ? "VR MODE · PHASE 2" : "VR DATA NOT READY"}</button>
          </div>
        </div>
      </section>
    </main>
  );
}
