"use client";

import { useEffect, useRef, useState } from "react";

type VideoWithFirstFrameProps = {
  src: string;
  label?: string;
  poster?: string;
};

export default function VideoWithFirstFrame({
  src,
  label = "Project video",
  poster,
}: VideoWithFirstFrameProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [generatedPoster, setGeneratedPoster] = useState<string>();

  useEffect(() => {
    if (poster) return;

    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;

    const capture = () => {
      if (cancelled || !video.videoWidth || !video.videoHeight) return;

      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
        if (!cancelled) setGeneratedPoster(dataUrl);
      } catch {
        // Keep the browser's native video preview if capture is blocked.
      }
    };

    const onLoadedData = () => {
      video.currentTime = 0;
      if (video.readyState >= 2) capture();
    };

    if (video.readyState >= 2) onLoadedData();
    else video.addEventListener("loadeddata", onLoadedData, { once: true });

    return () => {
      cancelled = true;
      video.removeEventListener("loadeddata", onLoadedData);
    };
  }, [poster, src]);

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster ?? generatedPoster}
      controls
      playsInline
      preload="auto"
      crossOrigin="anonymous"
      aria-label={label}
    />
  );
}
