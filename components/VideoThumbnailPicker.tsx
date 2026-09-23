"use client";

import { upload } from "@vercel/blob/client";
import { useEffect, useRef, useState } from "react";

export default function VideoThumbnailPicker({
  src,
  currentThumbnail,
  workId,
  layerId,
  onThumbnailSaved,
}: {
  src: string;
  currentThumbnail?: string;
  workId: string;
  layerId: string;
  onThumbnailSaved: (url: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [preview, setPreview] = useState<string | undefined>(currentThumbnail);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setPreview(currentThumbnail);
  }, [currentThumbnail]);

  function handleLoadedMetadata() {
    const video = videoRef.current;
    if (!video) return;
    setDuration(Number.isFinite(video.duration) ? video.duration : 0);
    setTime(0);
  }

  function handleTimeUpdate() {
    const video = videoRef.current;
    if (video) setTime(video.currentTime);
  }

  function seek(value: number) {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = value;
    setTime(value);
  }

  async function saveCurrentFrame() {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) return;

    setSaving(true);
    setError("");

    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas is unavailable.");

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.9)
      );

      if (!blob) throw new Error("Could not create thumbnail.");

      const file = new File(
        [blob],
        `thumbnail-${workId}-${layerId}-${Math.round(time * 1000)}.jpg`,
        { type: "image/jpeg" }
      );

      const uploaded = await upload(
        `landing-thumbnail-${workId}-${layerId}-${Date.now()}.jpg`,
        file,
        {
          access: "public",
          handleUploadUrl: "/api/upload",
        }
      );

      setPreview(uploaded.url);
      onThumbnailSaved(uploaded.url);
    } catch (err) {
      console.error(err);
      setError(
        "Could not capture this frame. Try another frame or check the video's access settings."
      );
    } finally {
      setSaving(false);
    }
  }

  const formattedTime = (value: number) => {
    const minutes = Math.floor(value / 60);
    const seconds = Math.floor(value % 60);
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  };

  return (
    <div
      style={{
        marginTop: 12,
        padding: 14,
        border: "1px solid rgba(255,255,255,.12)",
        borderRadius: 12,
        background: "rgba(255,255,255,.025)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          marginBottom: 10,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 10,
              letterSpacing: ".16em",
              textTransform: "uppercase",
              opacity: 0.55,
              marginBottom: 4,
            }}
          >
            Video thumbnail
          </div>
          <div style={{ fontSize: 13 }}>
            Choose the exact frame used as the preview.
          </div>
        </div>
        {preview && (
          <span style={{ fontSize: 10, opacity: 0.55 }}>Custom thumbnail set</span>
        )}
      </div>

      <video
        ref={videoRef}
        src={src}
        poster={preview}
        controls
        playsInline
        preload="metadata"
        crossOrigin="anonymous"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        style={{
          display: "block",
          width: "100%",
          height: "auto",
          maxHeight: 420,
          objectFit: "contain",
          background: "#090a0b",
          borderRadius: 8,
        }}
      />

      {duration > 0 && (
        <div style={{ marginTop: 12 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              fontSize: 11,
              fontVariantNumeric: "tabular-nums",
              opacity: 0.65,
              marginBottom: 6,
            }}
          >
            <span>{formattedTime(time)}</span>
            <span>{formattedTime(duration)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={duration}
            step={0.01}
            value={time}
            onChange={(event) => seek(Number(event.target.value))}
            style={{ width: "100%" }}
            aria-label="Choose video thumbnail frame"
          />
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={saveCurrentFrame}
          disabled={saving || duration === 0}
        >
          {saving ? "Saving thumbnail…" : `Use ${formattedTime(time)} as thumbnail`}
        </button>
        {error && <span style={{ fontSize: 11, color: "#d98b8b" }}>{error}</span>}
      </div>

      {preview && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 10, opacity: 0.5, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".12em" }}>
            Selected thumbnail
          </div>
          <img
            src={preview}
            alt="Selected video thumbnail"
            style={{ display: "block", width: "100%", maxHeight: 180, objectFit: "contain", background: "#090a0b", borderRadius: 8 }}
          />
        </div>
      )}
    </div>
  );
}
