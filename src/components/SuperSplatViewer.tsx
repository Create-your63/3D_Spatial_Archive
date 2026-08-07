import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ResolvedViewerSource } from "../viewer/types";
import { createSuperSplatViewerUrl } from "../viewer/viewerUrl";

export type SuperSplatViewerStatus = "preparing" | "loading" | "ready" | "error";

type RuntimeMessage = {
  source: "spatial-archive-supersplat";
  status: "loading" | "ready" | "error";
  detail?: string;
};

type Props = {
  source: ResolvedViewerSource;
  title: string;
  onStatusChange?: (status: SuperSplatViewerStatus) => void;
};

export default function SuperSplatViewer({ source, title, onStatusChange }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const runtimeUrl = useMemo(() => createSuperSplatViewerUrl(source), [source]);
  const [status, setStatus] = useState<SuperSplatViewerStatus>("preparing");
  const [errorMessage, setErrorMessage] = useState("");

  const reportStatus = useCallback((nextStatus: SuperSplatViewerStatus) => {
    setStatus(nextStatus);
    onStatusChange?.(nextStatus);
  }, [onStatusChange]);

  useEffect(() => {
    setErrorMessage("");
    reportStatus("preparing");

    function handleMessage(event: MessageEvent<RuntimeMessage | string>) {
      if (event.source !== iframeRef.current?.contentWindow || event.origin !== window.location.origin) return;

      if (event.data === "requestFullscreen") {
        iframeRef.current?.requestFullscreen?.();
        return;
      }
      if (event.data === "exitFullscreen") {
        if (document.fullscreenElement) void document.exitFullscreen?.();
        return;
      }
      if (typeof event.data !== "object" || event.data?.source !== "spatial-archive-supersplat") return;

      if (event.data.status === "error") {
        setErrorMessage(event.data.detail || "SuperSplat runtime이 asset을 불러오지 못했습니다.");
      }
      reportStatus(event.data.status);
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [reportStatus, runtimeUrl]);

  return (
    <div className="supersplat-viewer-host" data-status={status}>
      <iframe
        ref={iframeRef}
        className="supersplat-viewer-frame"
        src={runtimeUrl}
        title={`${title} SuperSplat Viewer`}
        allow="fullscreen"
        allowFullScreen
        onLoad={() => setStatus((current) => {
          if (current === "ready" || current === "error") return current;
          onStatusChange?.("loading");
          return "loading";
        })}
        onError={() => {
          setErrorMessage("Self-hosted SuperSplat runtime을 열지 못했습니다.");
          reportStatus("error");
        }}
      />
      {status === "preparing" && <div className="supersplat-state">VIEWER RUNTIME PREPARING</div>}
      {status === "error" && <div className="supersplat-state is-error">{errorMessage}</div>}
    </div>
  );
}
