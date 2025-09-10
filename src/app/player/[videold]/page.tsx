"use client";

import { useState, useRef } from "react";
import { Slider } from "@mui/material";

export default function PlayerPage() {
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 🔹 Called when user drags the slider
  const handleSeekChange = (
    _: Event | React.SyntheticEvent,
    value: number | number[]
  ) => {
    if (typeof value === "number") {
      setProgress(value);
    }
  };

  // 🔹 Called when user releases the slider
  const handleSeek = (
    event: Event | React.SyntheticEvent,
    value: number | number[]
  ) => {
    if (typeof value === "number" && audioRef.current) {
      audioRef.current.currentTime = value;
      setProgress(value);
    }
  };

  // 🔹 Called when user starts dragging
  const handleSeekStart = () => {
    // You can pause audio here if you want
  };

  return (
    <div style={{ padding: "20px" }}>
      <audio
        ref={audioRef}
        src="/example.mp3"
        onLoadedMetadata={() => {
          if (audioRef.current) setDuration(audioRef.current.duration);
        }}
      />

      <Slider
        value={progress}
        min={0}
        max={duration || 100}
        step={1}
        onChange={handleSeekChange}
        onChangeCommitted={handleSeek} // ✅ TS-safe now
        onMouseDown={handleSeekStart}
        disabled={isLoading || !duration || !!error}
        sx={{ color: "primary.main" }}
      />
    </div>
  );
}
