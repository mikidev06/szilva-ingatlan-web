import { useEffect, useState } from "react";

export default function Gallery({ images, title }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [maximized, setMaximized] = useState(false);
  const [hovered, setHovered] = useState(false);

  const hasImages = images && images.length > 0;
  const hasMultiple = hasImages && images.length > 1;

  const prevIndex = hasImages ? (index - 1 + images.length) % images.length : 0;
  const nextIndex = hasImages ? (index + 1) % images.length : 0;

  function goPrev() {
    setDirection(-1);
    setIndex(prevIndex);
  }

  function goNext() {
    setDirection(1);
    setIndex(nextIndex);
  }

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
      setDirection(1);
      setIndex(nextIndex);
    }, 5000);

    return () => clearTimeout(timer);
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
            <img src={images[prevIndex]} alt="" />
          </button>
        )}

        <div className="gallery-main">
          <img
            key={index}
            src={images[index]}
            alt={`${title} – ${index + 1}. kép`}
            onClick={() => setMaximized(true)}
            className={direction === 1 ? "gallery-slide-next" : "gallery-slide-prev"}
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
            <img src={images[nextIndex]} alt="" />
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
