"use client";

import { useEffect, useRef, useState } from "react";

type VideoWithFirstFrameProps = {
  src: string;
  label?: string;
  poster?: string;
};

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 5.5v13L18.5 12 8 5.5Z" fill="currentColor" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor" />
    </svg>
  );
}

export default function VideoWithFirstFrame({
  src,
  label = "Project video",
  poster,
}: VideoWithFirstFrameProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [generatedPoster, setGeneratedPoster] = useState<string>();
  const [playing, setPlaying] = useState(false);

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
        // Keep the browser's normal video preview if capture is unavailable.
      }
    };

    const onLoadedData = () => {
      video.currentTime = 0;
      if (video.readyState >= 2) capture();
    };

    if (video.readyState >= 2) {
      onLoadedData();
    } else {
      video.addEventListener("loadeddata", onLoadedData, { once: true });
    }

    return () => {
      cancelled = true;
      video.removeEventListener("loadeddata", onLoadedData);
    };
  }, [poster, src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
    };
  }, [src]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      void video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  };

  return (
    <div className={`custom-video-player${playing ? " is-playing" : ""}`}>
      <video
        ref={videoRef}
        src={src}
        poster={poster ?? generatedPoster}
        playsInline
        preload="auto"
        crossOrigin="anonymous"
        aria-label={label}
        onClick={togglePlay}
      />

      <button
        type="button"
        className="custom-video-play"
        onClick={togglePlay}
        aria-label={playing ? "Pause video" : "Play video"}
      >
        {playing ? <PauseIcon /> : <PlayIcon />}
      </button>
    </div>
  );
}
