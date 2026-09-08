import { useEffect, useState } from "react";

const SLIDE_DURATION = 600;

export default function Gallery({ images, title }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [maximized, setMaximized] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [outgoing, setOutgoing] = useState(null); // { src, direction } | null

  const hasImages = images && images.length > 0;
  const hasMultiple = hasImages && images.length > 1;

  const prevIndex = hasImages ? (index - 1 + images.length) % images.length : 0;
  const nextIndex = hasImages ? (index + 1) % images.length : 0;

  function changeTo(newIndex, dir) {
    setOutgoing({ src: images[index], direction: dir });
    setDirection(dir);
    setIndex(newIndex);
  }

  function goPrev() {
    changeTo(prevIndex, -1);
  }

  function goNext() {
    changeTo(nextIndex, 1);
  }

  useEffect(() => {
    if (!outgoing) return;
    const timer = setTimeout(() => setOutgoing(null), SLIDE_DURATION);
    return () => clearTimeout(timer);
  }, [outgoing]);

  useEffect(() => {
    if (!maximized) return;

    function handleKeyDown(e) {
      if (e.key === "Escape") setMaximized(false);
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maximized, prevIndex, nextIndex]);

  useEffect(() => {
    if (!hasMultiple || maximized || hovered) return;

    const timer = setTimeout(() => {
      changeTo(nextIndex, 1);
    }, 3000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMultiple, maximized, hovered, nextIndex]);

  if (!hasImages) {
    return (
      <div className="gallery-empty">
        <span>📷</span>
        Ehhez az ingatlanhoz még nincs feltöltött fénykép.
      </div>
    );
  }

  return (
    <>
      <div
        className="gallery"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {hasMultiple && (
          <button
            type="button"
            className="gallery-side-thumb"
            onClick={goPrev}
            aria-label="Előző kép"
          >
            <img src={images[prevIndex]} alt="" decoding="async" />
          </button>
        )}

        <div className="gallery-main">
          {outgoing && (
            <img
              key={`out-${outgoing.src}`}
              src={outgoing.src}
              alt=""
              aria-hidden="true"
              className={outgoing.direction === 1 ? "gallery-slide-out-left" : "gallery-slide-out-right"}
            />
          )}
          <img
            key={index}
            src={images[index]}
            alt={`${title} – ${index + 1}. kép`}
            onClick={() => setMaximized(true)}
            decoding="async"
            className={direction === 1 ? "gallery-slide-in-right" : "gallery-slide-in-left"}
          />

          {hasMultiple && (
            <>
              <button
                type="button"
                className="gallery-arrow gallery-arrow-left"
                onClick={goPrev}
                aria-label="Előző kép"
              >
                ‹
              </button>
              <button
                type="button"
                className="gallery-arrow gallery-arrow-right"
                onClick={goNext}
                aria-label="Következő kép"
              >
                ›
              </button>
              <div className="gallery-counter">
                {index + 1} / {images.length}
              </div>
            </>
          )}
        </div>

        {hasMultiple && (
          <button
            type="button"
            className="gallery-side-thumb"
            onClick={goNext}
            aria-label="Következő kép"
          >
            <img src={images[nextIndex]} alt="" decoding="async" />
          </button>
        )}
      </div>

      {maximized && (
        <div className="lightbox" onClick={() => setMaximized(false)}>
          <button
            type="button"
            className="lightbox-close"
            onClick={() => setMaximized(false)}
            aria-label="Bezárás"
          >
            ✕
          </button>

          {hasMultiple && (
            <button
              type="button"
              className="lightbox-arrow lightbox-arrow-left"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              aria-label="Előző kép"
            >
              ‹
            </button>
          )}

          <img
            src={images[index]}
            alt={`${title} – ${index + 1}. kép`}
            onClick={(e) => e.stopPropagation()}
          />

          {hasMultiple && (
            <button
              type="button"
              className="lightbox-arrow lightbox-arrow-right"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              aria-label="Következő kép"
            >
              ›
            </button>
          )}
        </div>
      )}
    </>
  );
}
