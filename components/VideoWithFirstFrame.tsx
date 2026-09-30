“use client”;

import { useEffect, useRef, useState, type CSSProperties } from “react”;

type VideoWithFirstFrameProps = {
src: string;
label?: string;
poster?: string;
};

function PlayIcon() {
return (
);
}

function PauseIcon() {
return (
);
}

function VolumeIcon({ muted }: { muted: boolean }) {
return (
  {muted ? (
    <path
      d="m17 9 4 4m0-4-4 4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  ) : (
    <>
      <path
        d="M16 9.5c1.7 1.5 1.7 3.5 0 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M18.5 7c3 2.7 3 7.3 0 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </>
  )}
</svg>

);
}

function FullscreenIcon() {
return (
);
}

function formatTime(value: number) {
if (!Number.isFinite(value)) {
return “0:00”;
}

const total = Math.max(0, Math.floor(value));
const minutes = Math.floor(total / 60);
const seconds = String(total % 60).padStart(2, “0”);

return ${minutes}:${seconds};
}

export default function VideoWithFirstFrame({
src,
label = “Project video”,
poster,
}: VideoWithFirstFrameProps) {
const videoRef = useRef(null);

const [playing, setPlaying] = useState(false);
const [muted, setMuted] = useState(false);
const [currentTime, setCurrentTime] = useState(0);
const [duration, setDuration] = useState(0);

useEffect(() => {
const video = videoRef.current;

if (!video) {
  return;
}
const handlePlay = () => {
  setPlaying(true);
};
const handlePause = () => {
  setPlaying(false);
};
const handleTimeUpdate = () => {
  setCurrentTime(video.currentTime);
};
const handleMetadata = () => {
  if (Number.isFinite(video.duration)) {
    setDuration(video.duration);
  }
};
const handleDurationChange = () => {
  if (Number.isFinite(video.duration)) {
    setDuration(video.duration);
  }
};
const handleEnded = () => {
  setPlaying(false);
  if (Number.isFinite(video.duration)) {
    setCurrentTime(video.duration);
  }
};
video.addEventListener("play", handlePlay);
video.addEventListener("pause", handlePause);
video.addEventListener("timeupdate", handleTimeUpdate);
video.addEventListener("loadedmetadata", handleMetadata);
video.addEventListener("durationchange", handleDurationChange);
video.addEventListener("ended", handleEnded);
return () => {
  video.removeEventListener("play", handlePlay);
  video.removeEventListener("pause", handlePause);
  video.removeEventListener("timeupdate", handleTimeUpdate);
  video.removeEventListener("loadedmetadata", handleMetadata);
  video.removeEventListener(
    "durationchange",
    handleDurationChange
  );
  video.removeEventListener("ended", handleEnded);
};

}, [src]);

const playVideo = async () => {
const video = videoRef.current;

if (!video) {
  return;
}
try {
  /*
   * Start loading the actual video only when the user
   * requests playback. This avoids multiple videos
   * competing for bandwidth on the portfolio page.
   */
  if (video.readyState === 0) {
    video.preload = "auto";
    video.load();
  }
  await video.play();
} catch {
  // Browser/network errors are ignored so the UI stays usable.
}

};

const pauseVideo = () => {
const video = videoRef.current;

if (!video) {
  return;
}
video.pause();

};

const togglePlay = () => {
const video = videoRef.current;

if (!video) {
  return;
}
if (video.paused) {
  void playVideo();
} else {
  pauseVideo();
}

};

const toggleMute = () => {
const video = videoRef.current;

if (!video) {
  return;
}
video.muted = !video.muted;
setMuted(video.muted);

};

const seek = (value: number) => {
const video = videoRef.current;

if (!video || !Number.isFinite(value)) {
  return;
}
video.currentTime = value;
setCurrentTime(value);

};

const toggleFullscreen = async () => {
const video = videoRef.current;

if (!video) {
  return;
}
try {
  if (document.fullscreenElement) {
    await document.exitFullscreen();
    return;
  }
  const wrapper = video.closest(
    ".custom-video-player"
  ) as HTMLElement | null;
  if (wrapper?.requestFullscreen) {
    await wrapper.requestFullscreen();
    return;
  }
  if ("webkitEnterFullscreen" in video) {
    (
      video as HTMLVideoElement & {
        webkitEnterFullscreen?: () => void;
      }
    ).webkitEnterFullscreen?.();
  }
} catch {
  // Fullscreen can be rejected by the browser.
}

};

const progress =
duration > 0
? Math.min(100, Math.max(0, (currentTime / duration) * 100))
: 0;

return (
<div
className={custom-video-player${ playing ? " is-playing" : "" }}
>
  <button
    type="button"
    className="custom-video-play"
    onClick={togglePlay}
    aria-label={playing ? "Pause video" : "Play video"}
  >
    {playing ? <PauseIcon /> : <PlayIcon />}
  </button>
  <div className="custom-video-controls">
    <button
      type="button"
      className="custom-video-control-button"
      onClick={togglePlay}
      aria-label={playing ? "Pause video" : "Play video"}
    >
      {playing ? <PauseIcon /> : <PlayIcon />}
    </button>
    <span className="custom-video-time">
      {formatTime(currentTime)}
    </span>
    <input
      className="custom-video-progress"
      type="range"
      min="0"
      max={duration || 0}
      step="0.01"
      value={Math.min(currentTime, duration || 0)}
      onChange={(event) => {
        seek(Number(event.target.value));
      }}
      aria-label="Video progress"
      style={
        {
          "--video-progress": `${progress}%`,
        } as CSSProperties
      }
    />
    <span className="custom-video-time">
      {formatTime(duration)}
    </span>
    <button
      type="button"
      className="custom-video-control-button"
      onClick={toggleMute}
      aria-label={muted ? "Unmute video" : "Mute video"}
    >
      <VolumeIcon muted={muted} />
    </button>
    <button
      type="button"
      className="custom-video-control-button"
      onClick={() => void toggleFullscreen()}
      aria-label="Fullscreen"
    >
      <FullscreenIcon />
    </button>
  </div>
</div>

);
}
