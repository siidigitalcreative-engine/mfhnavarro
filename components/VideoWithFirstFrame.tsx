"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

type VideoWithFirstFrameProps = {
  src: string;
  label?: string;
  poster?: string;
};

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M8 5.5v13L18.5 12 8 5.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M7 5h4v14H7zM13 5h4v14h-4z"
        fill="currentColor"
      />
    </svg>
  );
}

function VolumeIcon({ muted }: { muted: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 9v6h4l5 4V5L8 9H4Z"
        fill="currentColor"
      />

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
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M8 4H4v4M16 4h4v4M20 16v4h-4M4 16v4h4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatTime(value: number) {
  if (!Number.isFinite(value)) return "0:00";

  const total = Math.max(0, Math.floor(value));
  const minutes = Math.floor(total / 60);
  const seconds = String(total % 60).padStart(2, "0");

  return `${minutes}:${seconds}`;
}

export default function VideoWithFirstFrame({
  src,
  label = "Project video",
  poster,
}: VideoWithFirstFrameProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [videoLoaded, setVideoLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  /*
   * Load the actual MP4 only when this video is close to
   * entering the viewport. This is especially important
   * for Spotlight pages containing multiple videos.
   */
  useEffect(() => {
    const wrapper = wrapperRef.current;

    if (!wrapper) return;

    if (!("IntersectionObserver" in window)) {
      setVideoLoaded(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry?.isIntersecting) {
          setVideoLoaded(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "600px 0px",
        threshold: 0,
      }
    );

    observer.observe(wrapper);

    return () => {
      observer.disconnect();
    };
  }, []);

  /*
   * Once the video is allowed to load, assign the src directly
   * to the video element. The poster remains visible while the
   * browser fetches the actual MP4.
   */
  useEffect(() => {
    const video = videoRef.current;

    if (!video || !videoLoaded) return;

    if (video.src !== src) {
      video.src = src;
      video.load();
    }
  }, [src, videoLoaded]);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    const handlePlay = () => {
      setPlaying(true);
    };

    const handlePause = () => {
      setPlaying(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const updateDuration = () => {
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
    video.addEventListener("loadedmetadata", updateDuration);
    video.addEventListener("durationchange", updateDuration);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", updateDuration);
      video.removeEventListener("durationchange", updateDuration);
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  const ensureLoaded = () => {
    if (!videoLoaded) {
      setVideoLoaded(true);
    }
  };

  const playVideo = async () => {
    const video = videoRef.current;

    if (!video) return;

    ensureLoaded();

    /*
     * If the video has not been assigned its source yet,
     * wait for the next render/effect to assign it.
     */
    if (!video.src || video.readyState === 0) {
      setVideoLoaded(true);

      window.setTimeout(() => {
        const currentVideo = videoRef.current;

        if (!currentVideo) return;

        void currentVideo.play().catch(() => undefined);
      }, 0);

      return;
    }

    try {
      await video.play();
    } catch {
      // Ignore browser playback rejection.
    }
  };

  const togglePlay = () => {
    const video = videoRef.current;

    if (!video) return;

    if (video.paused) {
      void playVideo();
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

    /*
     * Seeking also makes sure the video source has been loaded.
     */
    ensureLoaded();

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
      ? Math.min(
          100,
          Math.max(0, (currentTime / duration) * 100)
        )
      : 0;

  return (
    <div
      ref={wrapperRef}
      className={`custom-video-player${
        playing ? " is-playing" : ""
      }`}
    >
      <video
        ref={videoRef}
        poster={poster}
        playsInline
        preload="none"
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
