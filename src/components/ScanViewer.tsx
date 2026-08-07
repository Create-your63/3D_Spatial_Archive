import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Box, CircleHelp, Expand, FolderOpen, Minus, MousePointer2, Plus, RotateCcw } from "lucide-react";
import type { ViewerModel } from "../viewer/viewerModel";
import SuperSplatViewer, { type SuperSplatViewerStatus } from "./SuperSplatViewer";

function DemoScan({ zoom, paused }: { zoom: number; paused: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    let frame = 0;
    let animation = 0;
    const points = Array.from({ length: 1050 }, (_, i) => ({
      x: Math.sin(i * 8.12) * (40 + (i % 190)),
      y: Math.cos(i * 2.73) * (28 + (i % 105)),
      z: ((i * 29) % 260) - 130,
      size: 0.4 + (i % 5) * 0.27,
      warm: i % 7 < 3,
    }));

    function render() {
      if (!canvas || !context) return;
      const dpr = Math.min(window.devicePixelRatio, 2);
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      context.fillStyle = "#080907";
      context.fillRect(0, 0, width, height);
      context.strokeStyle = "rgba(210, 255, 69, .055)";
      context.lineWidth = 1;
      for (let x = -width; x < width * 2; x += 44) {
        context.beginPath();
        context.moveTo(width / 2 + (x - width / 2) * .25, height * .58);
        context.lineTo(x, height);
        context.stroke();
      }
      for (let y = height * .58; y < height; y += 33) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(width, y);
        context.stroke();
      }
      const angle = frame * .0015;
      points.forEach((point) => {
        const rx = point.x * Math.cos(angle) - point.z * Math.sin(angle);
        const rz = point.x * Math.sin(angle) + point.z * Math.cos(angle);
        const perspective = 420 / (520 + rz);
        const x = width / 2 + rx * perspective * zoom * 1.7;
        const y = height / 2 + point.y * perspective * zoom * 1.9;
        const alpha = Math.max(.15, Math.min(.9, .64 - rz / 620));
        context.fillStyle = point.warm ? `rgba(216,255,63,${alpha})` : `rgba(210,221,192,${alpha * .72})`;
        context.beginPath();
        context.arc(x, y, point.size * perspective * 2.1, 0, Math.PI * 2);
        context.fill();
      });
      if (!paused) frame++;
      animation = requestAnimationFrame(render);
    }
    render();
    return () => cancelAnimationFrame(animation);
  }, [paused, zoom]);

  return <canvas ref={canvasRef} className="viewer-canvas" />;
}

const runtimeStatusLabel: Record<SuperSplatViewerStatus, string> = {
  preparing: "VIEWER RUNTIME PREPARING",
  loading: "3DGS ASSET LOADING",
  ready: "SUPERSPLAT VIEWER READY",
  error: "3DGS LOAD FAILURE",
};

export type LocalAssetControl = {
  available: boolean;
  supported: boolean;
  status: "idle" | "restoring" | "selecting" | "connected" | "error";
  directoryName?: string;
  message?: string;
  onSelect: () => void;
};

type Props = {
  model: ViewerModel;
  localAssetControl?: LocalAssetControl;
};

export default function ScanViewer({ model, localAssetControl }: Props) {
  const [zoom, setZoom] = useState(1);
  const [paused, setPaused] = useState(false);
  const [runtimeStatus, setRuntimeStatus] = useState<SuperSplatViewerStatus>("preparing");
  const hasResolvedAsset = model.source.kind === "resolved";

  const statusLabel = model.source.kind === "resolved"
    ? runtimeStatusLabel[runtimeStatus]
    : model.source.reason === "source-unavailable"
      ? "3D ASSET REGISTERED · SOURCE NOT CONFIGURED"
      : "DEMO SCAN · SOG NOT CONNECTED";
  const showLocalAssetControl = Boolean(localAssetControl?.available);
  const localActionLabel = localAssetControl?.status === "selecting"
    ? "폴더 확인 중"
    : localAssetControl?.status === "connected"
      ? "폴더 변경"
      : localAssetControl?.status === "error"
        ? "다시 선택"
        : "3DGS 폴더 선택";

  return (
    <main className="viewer-page">
      {model.source.kind === "resolved" ? (
        <SuperSplatViewer
          source={model.source.value}
          title={model.title}
          onStatusChange={setRuntimeStatus}
        />
      ) : (
        <DemoScan zoom={zoom} paused={paused} />
      )}

      <header className="viewer-header">
        <Link to={`/records/${model.recordId}`}><ArrowLeft size={16} /> EXIT VIEWER</Link>
        <div><Box size={17} /><span>{model.title}<small>{model.titleEn} / REC {model.number}</small></span></div>
        <button onClick={() => document.documentElement.requestFullscreen?.()}><Expand size={16} /> FULLSCREEN</button>
      </header>

      <div className={`viewer-status${runtimeStatus === "error" && hasResolvedAsset ? " is-error" : ""}`}>
        <i /> {statusLabel}
      </div>

      {showLocalAssetControl && localAssetControl && (
        <section className={`viewer-local-source is-${localAssetControl.status}`} aria-label="로컬 3DGS 연결">
          <FolderOpen size={17} />
          <div>
            <span>LOCAL 3DGS SOURCE</span>
            <strong>
              {localAssetControl.status === "connected"
                ? localAssetControl.directoryName
                : localAssetControl.status === "restoring"
                  ? "저장된 폴더 확인 중"
                  : localAssetControl.supported
                    ? "파일은 브라우저 밖으로 업로드되지 않습니다."
                    : "Chrome 또는 Edge에서 사용할 수 있습니다."}
            </strong>
            {localAssetControl.message && <small>{localAssetControl.message}</small>}
          </div>
          <button
            type="button"
            onClick={localAssetControl.onSelect}
            disabled={!localAssetControl.supported || localAssetControl.status === "selecting" || localAssetControl.status === "restoring"}
          >
            {localActionLabel}
          </button>
        </section>
      )}

      {!hasResolvedAsset && (
        <>
          <div className="viewer-crosshair"><i /><i /></div>
          <div className="viewer-scale"><span>1 UNIT</span><i /><span>1 METER</span></div>
          <div className="viewer-controls">
            <button onClick={() => setZoom((value) => Math.min(1.8, value + .15))} aria-label="확대"><Plus /></button>
            <button onClick={() => setZoom((value) => Math.max(.55, value - .15))} aria-label="축소"><Minus /></button>
            <button onClick={() => { setZoom(1); setPaused(false); }} aria-label="뷰 초기화"><RotateCcw /></button>
          </div>
          <div className="viewer-hint">
            <MousePointer2 size={16} />
            <span>자동 회전 중<strong>컨트롤로 공간을 살펴보세요</strong></span>
            <button onClick={() => setPaused(!paused)}>{paused ? "재생" : "정지"}</button>
          </div>
        </>
      )}

      <div className="viewer-info">
        <CircleHelp size={15} />
        {model.source.kind === "resolved"
          ? `SELF-HOSTED SUPERSSPLAT · ${model.source.value.format.toUpperCase()}`
          : "실제 SOG 주소를 연결하면 SuperSplat 뷰어로 전환됩니다."}
      </div>
    </main>
  );
}
