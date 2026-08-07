import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AttributionControl, Map as MapLibreMap, Marker, NavigationControl } from "maplibre-gl";
import { ArrowRight, Box, ChevronDown, Crosshair, Layers3, MapPin, Search, X } from "lucide-react";
import { records, type RecordStatus, type SpatialRecord } from "../data/records";

const filterOptions: { value: "all" | RecordStatus; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "existing", label: "현존" },
  { value: "changed", label: "변화 중" },
  { value: "demolished", label: "철거됨" },
];

export default function ArchiveExplorer() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [selected, setSelected] = useState<SpatialRecord>(records[0]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | RecordStatus>("all");

  const filtered = useMemo(() => records.filter((record) => {
    const matchesFilter = filter === "all" || record.status === filter;
    const haystack = `${record.title} ${record.titleEn} ${record.area}`.toLowerCase();
    return matchesFilter && haystack.includes(query.toLowerCase());
  }), [filter, query]);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    const map = new MapLibreMap({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          "carto-dark": {
            type: "raster",
            tiles: [
              "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
              "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
              "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
              "https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
            maxzoom: 20,
            attribution: "&copy; CARTO, &copy; OpenStreetMap contributors",
          },
        },
        layers: [
          {
            id: "carto-dark",
            type: "raster",
            source: "carto-dark",
            paint: {
              "raster-opacity": 0.96,
              "raster-saturation": -0.18,
              "raster-contrast": 0.05,
            },
          },
        ],
      },
      center: [126.9708, 37.5476],
      zoom: 11.2,
      bearing: 0,
      pitch: 0,
      minZoom: 6,
      maxPitch: 0,
      dragRotate: false,
      touchPitch: false,
      pitchWithRotate: false,
      attributionControl: false,
      cooperativeGestures: true,
    });
    map.touchZoomRotate.disableRotation();
    map.keyboard.disableRotation();
    map.addControl(new NavigationControl({ showCompass: false }), "bottom-right");
    map.addControl(new AttributionControl({ compact: true }), "bottom-right");
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = filtered.map((record) => {
      const anchor = document.createElement("div");
      anchor.className = `archive-marker-anchor${selected.id === record.id ? " is-active" : ""}`;
      const element = document.createElement("button");
      element.className = `archive-marker status-${record.status}${selected.id === record.id ? " is-active" : ""}`;
      element.setAttribute("aria-label", `${record.title} 기록 선택`);
      element.innerHTML = `<span>${record.number}</span>`;
      element.addEventListener("click", () => selectRecord(record));
      anchor.appendChild(element);
      return new Marker({ element: anchor, anchor: "center" })
        .setLngLat([record.lng, record.lat]).addTo(map);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, selected.id]);

  function selectRecord(record: SpatialRecord) {
    setSelected(record);
    mapRef.current?.flyTo({
      center: [record.lng, record.lat],
      zoom: record.id === "buyeo-006" ? 12.5 : 14.2,
      bearing: 0,
      pitch: 0,
      duration: 1100,
    });
  }

  function resetMap() {
    mapRef.current?.flyTo({
      center: [126.9708, 37.5476],
      zoom: 11.2,
      bearing: 0,
      pitch: 0,
      duration: 900,
    });
  }

  return (
    <main className="archive-shell">
      <aside className="archive-sidebar">
        <header className="archive-header">
          <Link className="wordmark wordmark-dark" to="/">
            <span className="wordmark-mark" aria-hidden="true" />
            <span>SPATIAL<br />ARCHIVE</span>
          </Link>
          <span className="index-label">INDEX / 2024—26</span>
        </header>

        <div className="archive-title-row">
          <div><span className="eyebrow">FIELD RECORDS</span><h1>공간 기록</h1></div>
          <strong>{String(filtered.length).padStart(2, "0")}</strong>
        </div>

        <label className="search-field">
          <Search size={17} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="장소 또는 지역 검색" />
          {query && <button onClick={() => setQuery("")} aria-label="검색어 지우기"><X size={14} /></button>}
        </label>

        <div className="filter-row" aria-label="기록 상태 필터">
          {filterOptions.map((option) => (
            <button className={filter === option.value ? "active" : ""} key={option.value} onClick={() => setFilter(option.value)}>
              {option.label}
            </button>
          ))}
        </div>

        <div className="record-list">
          {filtered.map((record) => (
            <button key={record.id} className={`record-row ${selected.id === record.id ? "selected" : ""}`} onClick={() => selectRecord(record)}>
              <span className="record-number">{record.number}</span>
              <span className="record-main">
                <strong>{record.title}</strong>
                <small>{record.titleEn}</small>
                <span><i className={`status-dot ${record.status}`} /> {record.statusLabel} · {record.date}</span>
              </span>
              <ArrowRight className="record-arrow" size={17} />
            </button>
          ))}
          {filtered.length === 0 && <div className="empty-state">조건에 맞는 기록이 없습니다.</div>}
        </div>

        <footer className="sidebar-footer">
          <span>WHERE · WHEN · HOW · WHAT</span>
          <span>KR / EN <ChevronDown size={12} /></span>
        </footer>
      </aside>

      <section className="map-stage" aria-label="공간 기록 지도">
        <div ref={mapContainer} className="map-canvas" />
        <div className="map-topbar">
          <div className="map-mode"><MapPin size={14} /> MAP VIEW</div>
          <div className="map-coordinates">{selected.lat.toFixed(4)}° N&nbsp;&nbsp; {selected.lng.toFixed(4)}° E</div>
        </div>
        <button className="map-reset" onClick={resetMap}><Crosshair size={17} /> 전체 보기</button>
        <div className="map-legend">
          <span><i className="status-dot existing" /> 현존</span>
          <span><i className="status-dot changed" /> 변화 중</span>
          <span><i className="status-dot demolished" /> 철거됨</span>
        </div>

        <article className="map-record-card">
          <div className="card-index">REC / {selected.number}</div>
          <div className={`status-pill ${selected.status}`}><i />{selected.statusLabel}</div>
          <h2>{selected.title}</h2>
          <p className="record-en">{selected.titleEn}</p>
          <div className="card-meta">
            <span>LOCATION<strong>{selected.area}</strong></span>
            <span>RECORDED<strong>{selected.date}</strong></span>
          </div>
          <p className="card-description">{selected.description}</p>
          <div className="card-actions">
            <Link to={`/records/${selected.id}`}>기록 자세히 보기 <ArrowRight size={16} /></Link>
            <Link className="view-3d-button" to={`/viewer/${selected.id}`}><Box size={17} /> 3D로 보기</Link>
          </div>
        </article>

        <div className="map-layer-note"><Layers3 size={15} /> SPATIAL LAYER / 01</div>
      </section>
    </main>
  );
}
