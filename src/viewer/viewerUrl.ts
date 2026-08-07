import type { ResolvedViewerSource } from "./types";

function normalizeBaseUrl(baseUrl: string) {
  const withLeadingSlash = baseUrl.startsWith("/") ? baseUrl : `/${baseUrl}`;
  return withLeadingSlash.endsWith("/") ? withLeadingSlash : `${withLeadingSlash}/`;
}

export function createSuperSplatViewerUrl(
  source: ResolvedViewerSource,
  baseUrl = import.meta.env.BASE_URL,
  origin = window.location.origin,
) {
  const appBaseUrl = new URL(normalizeBaseUrl(baseUrl), origin);
  const runtimeUrl = new URL("supersplat-viewer/index.html", appBaseUrl);
  const settingsUrl = new URL(
    source.settingsUrl || "supersplat-viewer/settings.json",
    appBaseUrl,
  );
  const contentUrl = new URL(source.url, appBaseUrl);

  runtimeUrl.searchParams.set("content", contentUrl.toString());
  runtimeUrl.searchParams.set("settings", settingsUrl.toString());
  runtimeUrl.searchParams.set("lang", "ko");

  return runtimeUrl.toString();
}
