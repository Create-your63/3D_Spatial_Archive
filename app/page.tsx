import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Box, MapPin } from "lucide-react";

export const metadata = {
  title: "Spatial Archive — 사라지기 전의 장소들",
  description: "지도 위에서 장소의 시간과 3D 공간 기록을 탐색하는 아카이브",
};

export default function Home() {
  return (
    <main className="landing">
      <header className="landing-nav">
        <Link className="wordmark" href="/" aria-label="Spatial Archive 홈">
          <span className="wordmark-mark" aria-hidden="true" />
          <span>SPATIAL<br />ARCHIVE</span>
        </Link>
        <div className="landing-nav-meta">
          <span>37° 31′ N</span>
          <span>126° 58′ E</span>
          <Link href="/archive">ARCHIVE INDEX <ArrowUpRight size={14} /></Link>
        </div>
      </header>

      <section className="landing-hero">
        <div className="hero-kicker"><span /> A LIVING INDEX OF VANISHING PLACES</div>
        <h1>사라지기 전의<br /><em>장소를 기록합니다.</em></h1>
        <p className="hero-copy">
          장소의 좌표와 시간, 그리고 그 안의 감각을 3D로 수집합니다.<br />
          지도 위에 쌓이는 공간의 기억을 탐색해 보세요.
        </p>
        <Link className="hero-cta" href="/archive">
          <span>EXPLORE THE MAP</span>
          <ArrowDownRight size={23} />
        </Link>
      </section>

      <div className="hero-scan" aria-hidden="true">
        <div className="scan-orbit orbit-a" />
        <div className="scan-orbit orbit-b" />
        <div className="scan-grid" />
        <div className="scan-cloud">
          {Array.from({ length: 72 }).map((_, index) => (
            <i key={index} style={{ "--i": index } as React.CSSProperties} />
          ))}
        </div>
        <span className="scan-label label-one">POINT CLOUD / 04</span>
        <span className="scan-label label-two">ALT 32.4 M</span>
      </div>

      <footer className="landing-footer">
        <div className="archive-stat"><strong>06</strong><span>RECORDED<br />SPACES</span></div>
        <div className="archive-stat"><strong>24—26</strong><span>ACTIVE<br />YEARS</span></div>
        <div className="archive-stat"><MapPin size={18} /><span>SEOUL · BUYEO<br />SOUTH KOREA</span></div>
        <div className="archive-stat footer-note"><Box size={18} /><span>3D GAUSSIAN<br />SPLATTING</span></div>
      </footer>
    </main>
  );
}
