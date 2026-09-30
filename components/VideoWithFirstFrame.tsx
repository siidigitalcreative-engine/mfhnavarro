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
) : (
<>
</>
)}
);
}

function FullscreenIcon() {
return (
);
}

function formatTime(value: number) {
if (!Number.isFinite(value)) return “0:00”;

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
if (!video) return;

const onPlay = () => setPlaying(true);
const onPause = () => setPlaying(false);
const onTimeUpdate = () => {
  setCurrentTime(video.currentTime);
};
const updateDuration = () => {
  setDuration(
    Number.isFinite(video.duration) ? video.duration : 0
  );
};
const onLoadedMetadata = updateDuration;
const onDurationChange = updateDuration;
const onEnded = () => {
  setPlaying(false);
  setCurrentTime(
    Number.isFinite(video.duration) ? video.duration : 0
  );
};
video.addEventListener("play", onPlay);
video.addEventListener("pause", onPause);
video.addEventListener("timeupdate", onTimeUpdate);
video.addEventListener("loadedmetadata", onLoadedMetadata);
video.addEventListener("durationchange", onDurationChange);
video.addEventListener("ended", onEnded);
return () => {
  video.removeEventListener("play", onPlay);
  video.removeEventListener("pause", onPause);
  video.removeEventListener("timeupdate", onTimeUpdate);
  video.removeEventListener("loadedmetadata", onLoadedMetadata);
  video.removeEventListener("durationchange", onDurationChange);
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
  const wrapper = video.closest(
    ".custom-video-player"
  ) as HTMLElement | null;
  if (wrapper?.requestFullscreen) {
    await wrapper.requestFullscreen();
  } else if ("webkitEnterFullscreen" in video) {
    (
      video as HTMLVideoElement & {
        webkitEnterFullscreen?: () => void;
      }
    ).webkitEnterFullscreen?.();
  }
} catch {}

};

const progress =
duration > 0 ? (currentTime / duration) * 100 : 0;

return (
<div
className={custom-video-player${playing ? " is-playing" : ""}}
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
      onChange={(event) =>
        seek(Number(event.target.value))
      }
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
