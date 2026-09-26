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

type Point = {
  x: number;
  y: number;
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

  const pointersRef = useRef(new Map<number, Point>());
  const dragRef = useRef({ active: false, x: 0, y: 0 });
  const pinchRef = useRef({ active: false, distance: 0, scale: 1 });

  const current = images[index] ?? { src, alt };
  const hasMultiple = images.length > 1;

  const resetView = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
    dragRef.current.active = false;
    pinchRef.current.active = false;
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
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, images.length]);

  const getDistance = (a: Point, b: Point) =>
    Math.hypot(a.x - b.x, a.y - b.y);

  const getPointerPair = () => {
    const points = Array.from(pointersRef.current.values());
    if (points.length < 2) return null;
    return [points[0], points[1]] as const;
  };

  const onWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    setScale((value) => {
      const nextScale = value - event.deltaY * 0.0015;
      return Math.min(4, Math.max(1, nextScale));
    });
  };

  const onPointerDown = (event: React.PointerEvent<HTMLImageElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);

    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    if (pointersRef.current.size >= 2) {
      const pair = getPointerPair();
      if (!pair) return;

      pinchRef.current = {
        active: true,
        distance: getDistance(pair[0], pair[1]),
        scale,
      };
      dragRef.current.active = false;
      return;
    }

    if (scale > 1) {
      dragRef.current = {
        active: true,
        x: event.clientX - offset.x,
        y: event.clientY - offset.y,
      };
    }
  };

  const onPointerMove = (event: React.PointerEvent<HTMLImageElement>) => {
    if (!pointersRef.current.has(event.pointerId)) return;

    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    if (pointersRef.current.size >= 2 && pinchRef.current.active) {
      const pair = getPointerPair();
      if (!pair || pinchRef.current.distance <= 0) return;

      const distance = getDistance(pair[0], pair[1]);
      const pinchScale =
        pinchRef.current.scale * (distance / pinchRef.current.distance);

      setScale(Math.min(4, Math.max(1, pinchScale)));
      return;
    }

    if (!dragRef.current.active || scale <= 1) return;

    setOffset({
      x: event.clientX - dragRef.current.x,
      y: event.clientY - dragRef.current.y,
    });
  };

  const onPointerUp = (event: React.PointerEvent<HTMLImageElement>) => {
    pointersRef.current.delete(event.pointerId);

    if (pointersRef.current.size < 2) {
      pinchRef.current.active = false;
    }

    if (pointersRef.current.size === 1 && scale > 1) {
      const remaining = Array.from(pointersRef.current.values())[0];
      dragRef.current = {
        active: true,
        x: remaining.x - offset.x,
        y: remaining.y - offset.y,
      };
    } else {
      dragRef.current.active = false;
    }
  };

  const onPointerCancel = (event: React.PointerEvent<HTMLImageElement>) => {
    pointersRef.current.delete(event.pointerId);
    dragRef.current.active = false;
    pinchRef.current.active = false;
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
              onPointerCancel={onPointerCancel}
            />
          </div>

          {hasMultiple ? (
            <div className="landing-image-lightbox-counter">
              {index + 1} / {images.length}
            </div>
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
