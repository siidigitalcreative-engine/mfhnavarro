"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

type VideoWithFirstFrameProps = {
  src: string;
  label?: string;
  poster?: string;
};

function PlayIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13L18.5 12 8 5.5Z" fill="currentColor" /></svg>;
}

function PauseIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor" /></svg>;
}

function VolumeIcon({ muted }: { muted: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 9v6h4l5 4V5L8 9H4Z" fill="currentColor" />
      {muted ? (
        <path d="m17 9 4 4m0-4-4 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      ) : (
        <>
          <path d="M16 9.5c1.7 1.5 1.7 3.5 0 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M18.5 7c3 2.7 3 7.3 0 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

function FullscreenIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4H4v4M16 4h4v4M20 16v4h-4M4 16v4h4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function formatTime(value: number) {
  if (!Number.isFinite(value)) return "0:00";
  const total = Math.max(0, Math.floor(value));
  const minutes = Math.floor(total / 60);
  const seconds = String(total % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function VideoWithFirstFrame({ src, label = "Project video", poster }: VideoWithFirstFrameProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const playIntentRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.preload = "metadata";
    video.load();

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onLoadedMetadata = () => setDuration(Number.isFinite(video.duration) ? video.duration : 0);
    const onDurationChange = () => setDuration(Number.isFinite(video.duration) ? video.duration : 0);
    const onEnded = () => {
      playIntentRef.current = false;
      setPlaying(false);
      setCurrentTime(Number.isFinite(video.duration) ? video.duration : 0);
    };

    const resumeIfWanted = () => {
      if (playIntentRef.current && !video.ended) {
        void video.play().catch(() => undefined);
      }
    };

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("durationchange", onDurationChange);
    video.addEventListener("ended", onEnded);
    video.addEventListener("waiting", resumeIfWanted);
    video.addEventListener("stalled", resumeIfWanted);
    video.addEventListener("canplay", resumeIfWanted);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("durationchange", onDurationChange);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("waiting", resumeIfWanted);
      video.removeEventListener("stalled", resumeIfWanted);
      video.removeEventListener("canplay", resumeIfWanted);
    };
  }, [src]);

  const preparePlayback = () => {
    const video = videoRef.current;
    if (!video || !video.paused) return;

    playIntentRef.current = true;
    video.preload = "auto";

    if (video.readyState === 0) {
      video.load();
    }
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      preparePlayback();
      void video.play().catch(() => undefined);
    } else {
      playIntentRef.current = false;
      video.pause();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const seek = (value: number) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(value)) return;
    video.currentTime = value;
    setCurrentTime(value);
  };

  const toggleFullscreen = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }
      const wrapper = video.closest(".custom-video-player") as HTMLElement | null;
      if (wrapper?.requestFullscreen) {
        await wrapper.requestFullscreen();
      } else if ("webkitEnterFullscreen" in video) {
        (video as HTMLVideoElement & { webkitEnterFullscreen?: () => void }).webkitEnterFullscreen?.();
      }
    } catch {}
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`custom-video-player${playing ? " is-playing" : ""}`}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        playsInline
        preload="metadata"
        loading="lazy"
        aria-label={label}
        onPointerDown={preparePlayback}
        onClick={togglePlay}
      />
      <button
        type="button"
        className="custom-video-play"
        onPointerDown={preparePlayback}
        onClick={togglePlay}
        aria-label={playing ? "Pause video" : "Play video"}
      >
        {playing ? <PauseIcon /> : <PlayIcon />}
      </button>
      <div className="custom-video-controls">
        <button type="button" className="custom-video-control-button" onClick={togglePlay} aria-label={playing ? "Pause video" : "Play video"}>
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
        <span className="custom-video-time">{formatTime(currentTime)}</span>
        <input
          className="custom-video-progress"
          type="range"
          min="0"
          max={duration || 0}
          step="0.01"
          value={Math.min(currentTime, duration || 0)}
          onChange={(event) => seek(Number(event.target.value))}
          aria-label="Video progress"
          style={{ "--video-progress": `${progress}%` } as CSSProperties}
        />
        <span className="custom-video-time">{formatTime(duration)}</span>
        <button type="button" className="custom-video-control-button" onClick={toggleMute} aria-label={muted ? "Unmute video" : "Mute video"}>
          <VolumeIcon muted={muted} />
        </button>
        <button type="button" className="custom-video-control-button" onClick={() => void toggleFullscreen()} aria-label="Fullscreen">
          <FullscreenIcon />
        </button>
      </div>
    </div>
  );
}
