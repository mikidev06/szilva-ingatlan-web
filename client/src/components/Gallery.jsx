import { useEffect, useState } from "react";

export default function Gallery({ images, title }) {
  const [index, setIndex] = useState(0);
  const [focused, setFocused] = useState(false);

  const hasImages = images && images.length > 0;
  const hasMultiple = hasImages && images.length > 1;

  const prevIndex = hasImages ? (index - 1 + images.length) % images.length : 0;
  const nextIndex = hasImages ? (index + 1) % images.length : 0;

  function goPrev() {
    setIndex(prevIndex);
  }

  function goNext() {
    setIndex(nextIndex);
  }

  useEffect(() => {
    if (!focused) return;

    function handleKeyDown(e) {
      if (e.key === "Escape") setFocused(false);
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focused, prevIndex, nextIndex]);

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
      <div className="gallery">
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
            src={images[index]}
            alt={`${title} – ${index + 1}. kép`}
            onClick={() => setFocused(true)}
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

      {focused && (
        <div className="lightbox" onClick={() => setFocused(false)}>
          <button
            type="button"
            className="lightbox-close"
            onClick={() => setFocused(false)}
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
