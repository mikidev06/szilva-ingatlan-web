import { useState } from "react";

export default function MapEmbed({ src, title }) {
  const [active, setActive] = useState(false);

  return (
    <div
      className={`map-embed ${active ? "active" : ""}`}
      onClick={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
    >
      <iframe title={title} src={src} loading="lazy" />
      {!active && (
        <div className="map-embed-overlay">Kattintson a térkép mozgatásához</div>
      )}
    </div>
  );
}
