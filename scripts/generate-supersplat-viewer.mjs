import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { css, html, js } from "@playcanvas/supersplat-viewer";
import { validateSettings } from "@playcanvas/supersplat-viewer/settings";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(projectRoot, "public", "supersplat-viewer");
const packageEntry = fileURLToPath(import.meta.resolve("@playcanvas/supersplat-viewer"));
const packageRoot = path.resolve(path.dirname(packageEntry), "..");

const viewerSettings = {
  version: 2,
  tonemapping: "none",
  highPrecisionRendering: false,
  background: { color: [0.031, 0.035, 0.027] },
  postEffectSettings: {
    sharpness: { enabled: false, amount: 0 },
    bloom: { enabled: false, intensity: 1, blurLevel: 2 },
    grading: { enabled: false, brightness: 0, contrast: 1, saturation: 1, tint: [1, 1, 1] },
    vignette: { enabled: false, intensity: 0.5, inner: 0.3, outer: 0.75, curvature: 1 },
    fringing: { enabled: false, intensity: 0.5 },
  },
  animTracks: [],
  cameras: [{ initial: { position: [0, 1, -1], target: [0, 0, 0], fov: 60 } }],
  annotations: [],
  startMode: "default",
};

validateSettings(viewerSettings);

const bridgeMarker = "        <!-- Application Script -->";
const bridgeScript = `        <script>
            const notifyHost = (status, detail) => {
                if (window.parent === window) return;
                window.parent.postMessage({
                    source: 'spatial-archive-supersplat',
                    status,
                    detail
                }, window.location.origin);
            };

            window.firstFrame = () => notifyHost('ready');
            window.addEventListener('error', (event) => notifyHost('error', event.message));
            window.addEventListener('unhandledrejection', (event) => {
                const reason = event.reason;
                notifyHost('error', reason instanceof Error ? reason.message : String(reason));
            });
            notifyHost('loading');
        </script>`;

if (!html.includes(bridgeMarker)) {
  throw new Error("The installed SuperSplat Viewer HTML template has changed; bridge insertion was aborted.");
}
if (!js.includes("window.firstFrame?.()")) {
  throw new Error("The installed SuperSplat Viewer no longer exposes the first-frame hook; generation was aborted.");
}

const generatedHtml = html.replace(bridgeMarker, `${bridgeScript}\n${bridgeMarker}`);
const license = await readFile(path.join(packageRoot, "LICENSE"), "utf8");

await mkdir(outputDirectory, { recursive: true });
await Promise.all([
  writeFile(path.join(outputDirectory, "index.html"), generatedHtml),
  writeFile(path.join(outputDirectory, "index.css"), css),
  writeFile(path.join(outputDirectory, "index.js"), js),
  writeFile(path.join(outputDirectory, "settings.json"), `${JSON.stringify(viewerSettings, null, 2)}\n`),
  writeFile(path.join(outputDirectory, "LICENSE.txt"), license),
]);

console.log(`Generated SuperSplat Viewer runtime in ${path.relative(projectRoot, outputDirectory)}`);
