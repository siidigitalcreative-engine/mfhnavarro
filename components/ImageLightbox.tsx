"use client";

import { useEffect, useRef, useState } from "react";

type LightboxImage = {
  src: string;
  alt: string;
};

type Props = {
  src: string;
  alt: string;
  images?: LightboxImage[];
  initialIndex?: number;
};

export default function ImageLightbox({
  src,
  alt,
  images = [{ src, alt }],
  initialIndex = 0,
}: Props) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef({ active: false, x: 0, y: 0 });

  const current = images[index] ?? { src, alt };
  const hasMultiple = images.length > 1;

  const resetView = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const close = () => {
    setOpen(false);
    resetView();
  };

  const openAt = () => {
    setIndex(initialIndex);
    resetView();
    setOpen(true);
  };

  const previous = () => {
    if (!hasMultiple) return;
    setIndex((currentIndex) => Math.max(0, currentIndex - 1));
    resetView();
  };

  const next = () => {
    if (!hasMultiple) return;
    setIndex((currentIndex) => Math.min(images.length - 1, currentIndex + 1));
    resetView();
  };

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") previous();
      if (event.key === "ArrowRight") next();
      if (event.key === "+" || event.key === "=") {
        setScale((value) => Math.min(4, value + 0.25));
      }
      if (event.key === "-") {
        setScale((value) => Math.max(1, value - 0.25));
      }
      if (event.key === "0") resetView();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, images.length]);

  const onWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    setScale((value) => {
      const nextScale = value - event.deltaY * 0.0015;
      return Math.min(4, Math.max(1, nextScale));
    });
  };

  const onPointerDown = (event: React.PointerEvent<HTMLImageElement>) => {
    if (scale <= 1) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      active: true,
      x: event.clientX - offset.x,
      y: event.clientY - offset.y,
    };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLImageElement>) => {
    if (!dragRef.current.active || scale <= 1) return;
    setOffset({
      x: event.clientX - dragRef.current.x,
      y: event.clientY - dragRef.current.y,
    });
  };

  const onPointerUp = () => {
    dragRef.current.active = false;
  };

  return (
    <>
      <button
        type="button"
        className="landing-image-lightbox-trigger"
        onClick={openAt}
        aria-label={`Open ${alt} in image viewer`}
      >
        <img src={src} alt={alt} />
      </button>

      {open ? (
        <div
          className="landing-image-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
          onClick={close}
        >
          <div
            className="landing-image-lightbox-backdrop"
            onWheel={onWheel}
            onClick={(event) => event.stopPropagation()}
          />

          <div
            className="landing-image-lightbox-stage"
            onWheel={onWheel}
            onClick={(event) => event.stopPropagation()}
          >
            <img
              className="landing-image-lightbox-image"
              src={current.src}
              alt={current.alt}
              draggable={false}
              style={{
                transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`,
              }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            />
          </div>

          <div className="landing-image-lightbox-toolbar">
            <button
              type="button"
              className="landing-image-lightbox-control"
              onClick={() => setScale((value) => Math.min(4, value + 0.25))}
              aria-label="Zoom in"
            >
              +
            </button>
            <span className="landing-image-lightbox-zoom">
              {Math.round(scale * 100)}%
            </span>
            <button
              type="button"
              className="landing-image-lightbox-control"
              onClick={() => {
                const nextScale = Math.max(1, scale - 0.25);
                setScale(nextScale);
                if (nextScale === 1) setOffset({ x: 0, y: 0 });
              }}
              aria-label="Zoom out"
            >
              −
            </button>
            <button
              type="button"
              className="landing-image-lightbox-control"
              onClick={resetView}
              aria-label="Reset zoom"
            >
              1:1
            </button>
          </div>

          {hasMultiple ? (
            <>
              <button
                type="button"
                className="landing-image-lightbox-nav landing-image-lightbox-prev"
                onClick={(event) => {
                  event.stopPropagation();
                  previous();
                }}
                disabled={index === 0}
                aria-label="Previous image"
              >
                ‹
              </button>
              <button
                type="button"
                className="landing-image-lightbox-nav landing-image-lightbox-next"
                onClick={(event) => {
                  event.stopPropagation();
                  next();
                }}
                disabled={index === images.length - 1}
                aria-label="Next image"
              >
                ›
              </button>
              <div className="landing-image-lightbox-counter">
                {index + 1} / {images.length}
              </div>
            </>
          ) : null}

          <button
            type="button"
            className="landing-image-lightbox-close"
            onClick={(event) => {
              event.stopPropagation();
              close();
            }}
            aria-label="Close image viewer"
          >
            ×
          </button>
        </div>
      ) : null}
    </>
  );
}
