"use client";

import { useParams } from "next/navigation";
import { Card, CardContent, Typography, IconButton, Box, Slider, CardMedia } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import { useRef, useEffect } from "react";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../store/store"; // Path to your store file
import {
  setIsPlaying,
  setProgress,
  setDuration,
  setCurrentTime,
  setVolume,
  setIsMuted,
  setIsLoading,
  setError,
  setIsSeeking,
  setAudioDetails,
  resetPlayer,
} from "../../../store/slices/playerSlice"; // Path to player slice

export default function PlayerPage() {
  const params = useParams();
  const videoId = params?.videold;
  const audioRef = useRef<HTMLAudioElement>(null);
  const dispatch = useDispatch();

  const {
    isPlaying,
    progress,
    duration,
    currentTime,
    volume,
    isMuted,
    isLoading,
    error,
    isSeeking,
    audioDetails,
  } = useSelector((state: RootState) => state.player);

  // Reset player when videoId changes
  useEffect(() => {
    dispatch(resetPlayer());
  }, [videoId, dispatch]);

  // Load audio details from sessionStorage once
  useEffect(() => {
    const stored = sessionStorage.getItem("audioDetails");
    if (stored) {
      dispatch(setAudioDetails(JSON.parse(stored)));
    }
  }, [dispatch]);

  if (!videoId) {
    return (
      <Box sx={{ textAlign: "center", mt: 10 }}>
        <Typography variant="h6">❌ No song selected</Typography>
      </Box>
    );
  }

  const togglePlay = async () => {
    if (!audioRef.current) return;

    try {
      dispatch(setError(null));
      if (isPlaying) {
        audioRef.current.pause();
        dispatch(setIsPlaying(false));
      } else {
        await audioRef.current.play();
        dispatch(setIsPlaying(true));
      }
    } catch (err: any) {
      console.error("Play error:", err);
      dispatch(setError("Failed to play audio"));
      dispatch(setIsPlaying(false));
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current || isSeeking) return;

    const current = audioRef.current.currentTime;
    const total = audioRef.current.duration || 1;

    dispatch(setCurrentTime(current));
    dispatch(setProgress((current / total) * 100));
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;

    const dur = audioRef.current.duration;
    if (!isNaN(dur) && dur > 0) {
      dispatch(setDuration(dur));
      dispatch(setIsLoading(false));
    }
  };

  const handleCanPlay = () => {
    dispatch(setIsLoading(false));
    dispatch(setError(null));
  };

  const handleError = () => {
    dispatch(setError("Failed to load audio"));
    dispatch(setIsLoading(false));
    dispatch(setIsPlaying(false));
  };

  const handleLoadStart = () => {
    dispatch(setIsLoading(true));
  };

  const handleSeekStart = () => {
    dispatch(setIsSeeking(true));
  };

  const handleSeek = (_: Event, value: number | number[]) => {
    if (!audioRef.current || typeof value !== "number") return;

    const newTime = (audioRef.current.duration * value) / 100;
    audioRef.current.currentTime = newTime;
    dispatch(setProgress(value));
    dispatch(setCurrentTime(newTime));
    dispatch(setIsSeeking(false));
  };

  const handleSeekChange = (_: Event, value: number | number[]) => {
    if (typeof value !== "number") return;
    dispatch(setProgress(value));
    const newTime = (duration * value) / 100;
    dispatch(setCurrentTime(newTime));
  };

  const handleVolumeChange = (_: Event, value: number | number[]) => {
    if (!audioRef.current || typeof value !== "number") return;

    const newVolume = value;
    audioRef.current.volume = newVolume;
    dispatch(setVolume(newVolume));
    dispatch(setIsMuted(newVolume === 0));
  };

  const toggleMute = () => {
    if (!audioRef.current) return;

    const newMuted = !audioRef.current.muted;
    audioRef.current.muted = newMuted;
    dispatch(setIsMuted(newMuted));

    if (!newMuted) {
      dispatch(setVolume(audioRef.current.volume));
    }
  };

  const formatTime = (sec: number) => {
    if (isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        bgcolor: "background.default",
        color: "text.primary",
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 400,
          width: "100%",
          textAlign: "center",
          p: 3,
          mt: 5,
          borderRadius: 4,
          boxShadow: 6,
        }}
      >
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🎵 Now Playing
          </Typography>
          <Typography variant="h6" gutterBottom>
            {audioDetails?.title}
          </Typography>
          <CardMedia sx={{ height: 150, position: "relative" }}>
            <Image
              src={audioDetails?.thumbnailUrl || ""}
              alt={audioDetails?.title || ""}
              fill
              style={{
                objectFit: "contain",
                overflow: "hidden",
                borderRadius: "12px",
                border:"5px inset black"
              }}
            />
          </CardMedia>
          <audio
            ref={audioRef}
            src={`/api/audio?videoId=${videoId}`}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onCanPlay={handleCanPlay}
            onError={handleError}
            onLoadStart={handleLoadStart}
            onSeeked={() => dispatch(setIsSeeking(false))}
            onSeeking={() => dispatch(setIsSeeking(true))}
            preload="metadata"
            crossOrigin="anonymous"
          />

          {error && (
            <Typography variant="body2" color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          {isLoading && (
            <Typography variant="body2" sx={{ mb: 2 }}>
              Loading...
            </Typography>
          )}

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mt: 2,
            }}
          >
            <IconButton
              color="primary"
              onClick={togglePlay}
              disabled={isLoading || !!error}
              sx={{
                bgcolor: "primary.main",
                color: "white",
                "&:hover": { bgcolor: "primary.dark" },
                "&:disabled": { bgcolor: "grey.400" },
                width: 60,
                height: 60,
              }}
            >
              {isPlaying ? (
                <PauseIcon fontSize="large" />
              ) : (
                <PlayArrowIcon fontSize="large" />
              )}
            </IconButton>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Slider
              value={progress}
              onChange={handleSeekChange}
              onChangeCommitted={handleSeek}
              onMouseDown={handleSeekStart}
              disabled={isLoading || !duration || !!error}
              sx={{ color: "primary.main" }}
            />
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: -1 }}
            >
              <Typography variant="caption">{formatTime(currentTime)}</Typography>
              <Typography variant="caption">{formatTime(duration)}</Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mt: 2,
            }}
          >
            <IconButton onClick={toggleMute} disabled={isLoading || !!error}>
              {isMuted || volume === 0 ? (
                <VolumeOffIcon />
              ) : (
                <VolumeUpIcon />
              )}
            </IconButton>
            <Slider
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              step={0.01}
              min={0}
              max={1}
              disabled={isLoading || !!error}
              sx={{ width: 150, ml: 2 }}
            />
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            {isLoading
              ? "Loading audio stream..."
              : "Audio is playing via YouTube (audio-only)"}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
