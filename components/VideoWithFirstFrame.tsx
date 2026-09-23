 "use client";

import { useEffect, useRef, useState } from "react";

type VideoWithFirstFrameProps = {
  src: string;
  label?: string;
};

export default function VideoWithFirstFrame({
  src,
  label = "Project video",
}: VideoWithFirstFrameProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [poster, setPoster] = useState<string | undefined>();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;

    const captureFirstFrame = async () => {
      if (cancelled || !video.videoWidth || !video.videoHeight) return;

      try {
        video.currentTime = 0;

        const capture = () => {
          if (cancelled || !video.videoWidth || !video.videoHeight) return;

          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          try {
            const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
            if (!cancelled) setPoster(dataUrl);
          } catch {
            // If the remote video prevents canvas export, keep the
            // browser's native video preview rather than breaking playback.
          }
        };

        if (video.readyState >= 2) {
          capture();
        } else {
          video.addEventListener("loadeddata", capture, { once: true });
        }
      } catch {
        // Keep the video usable if first-frame capture is unavailable.
      }
    };

    if (video.readyState >= 2) {
      void captureFirstFrame();
    } else {
      video.addEventListener("loadeddata", captureFirstFrame, { once: true });
    }

    return () => {
      cancelled = true;
      video.removeEventListener("loadeddata", captureFirstFrame);
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      controls
      playsInline
      preload="auto"
      crossOrigin="anonymous"
      aria-label={label}
    />
  );
}
