"use client";

import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  Typography,
  Slider,
  CardMedia,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import { useRef, useEffect } from "react";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../store/store";
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
  setPlayingIndex,
} from "../../../store/slices/playerSlice";
import { addMusicToQueue } from "@/store/slices/homeData";

export default function PlayerPage() {
  const params = useParams();
  const videoId = params?.videold;
  const audioRef = useRef<HTMLAudioElement>(null);
  const dispatch = useDispatch();
  const router = useRouter();

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
    playingIndex,
  } = useSelector((state: RootState) => state.player);

  const musicQueue = useSelector((state: RootState) => state.home.musicQueue);

  // Reset player on videoId change
  useEffect(() => {
    dispatch(resetPlayer());
  }, [videoId, dispatch]);

  // Keep playingIndex safe (last item if queue updated)
  useEffect(() => {
    if (musicQueue.length > 0 && playingIndex >= musicQueue.length) {
      dispatch(setPlayingIndex(musicQueue.length - 1));
    }
  }, [musicQueue.length, playingIndex, dispatch]);

  // Keep audioDetails synced with current playingIndex
  useEffect(() => {
    const currentSong = musicQueue[playingIndex];
    if (currentSong) {
      dispatch(setAudioDetails(currentSong));
    }
  }, [playingIndex, musicQueue, dispatch]);

  if (!videoId) {
    return (
      <div className="text-center mt-10">
        <Typography variant="h6">❌ No song selected</Typography>
      </div>
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

  const handleNext = async () => {
    console.log("➡️ Next button clicked");

    // if next song already exists in queue
    if (playingIndex < musicQueue.length - 1) {
      const newIndex = playingIndex + 1;
      dispatch(setPlayingIndex(newIndex));
      router.push(`/player/${musicQueue[newIndex].videoId}`);
      return;
    }

    // else fetch new song
    try {
      const res = await fetch(`/api/nextsong/${audioDetails?.videoId}`);
      const songs = await res.json();
      const songIndex = Math.floor(Math.random() * songs.length);

      const nextSong = {
        title: songs[songIndex].title,
        thumbnailUrl: songs[songIndex].thumbnail,
        videoId: songs[songIndex].id,
        artists: [{ name: songs[songIndex].artist, artistId: "" }],
      };

      dispatch(addMusicToQueue(nextSong));

      const newIndex = musicQueue.length; // last item
      dispatch(setPlayingIndex(newIndex));
      dispatch(setAudioDetails(nextSong));

      router.push(`/player/${nextSong.videoId}`);
    } catch (err) {
      console.error("Failed to fetch next song:", err);
    }
  };

  const handlePrevious = () => {
    console.log("⬅️ Previous button clicked");

    if (playingIndex <= 0) {
      console.log("🚫 No previous track");
      return;
    }

    const newIndex = playingIndex - 1;
    dispatch(setPlayingIndex(newIndex));
    router.push(`/player/${musicQueue[newIndex].videoId}`);
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
    <div className="flex justify-center items-center h-screen bg-background text-text p-4">
      <Card className="max-w-md w-full text-center p-6 mt-8 rounded-2xl shadow-lg">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🎵 Now Playing
          </Typography>
          <Typography variant="h6" gutterBottom>
            {audioDetails?.title}
          </Typography>

          <CardMedia sx={{ height: 200, position: "relative" }}>
            <Image
              src={audioDetails?.thumbnailUrl || ""}
              alt={audioDetails?.title || ""}
              fill
              style={{
                objectFit: "fill",
                borderRadius: "12px",
                border: "5px inset black",
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
            onEnded={handleNext}
            preload="metadata"
            crossOrigin="anonymous"
          />

          {error && (
            <Typography variant="body2" color="error" className="mb-2">
              {error}
            </Typography>
          )}

          {isLoading && (
            <Typography variant="body2" className="mb-2">
              Loading...
            </Typography>
          )}

          {/* Controls */}
          <div className="flex justify-center items-center gap-6 mt-4">
            {/* Previous */}
            <button
              onClick={handlePrevious}
              disabled={isLoading || !!error}
              className="p-3 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-700 disabled:opacity-50"
            >
              <SkipPreviousIcon fontSize="large" />
            </button>

            {/* Play / Pause */}
            <button
              onClick={togglePlay}
              disabled={isLoading || !!error}
              className="p-4 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isPlaying ? (
                <PauseIcon fontSize="large" />
              ) : (
                <PlayArrowIcon fontSize="large" />
              )}
            </button>

            {/* Next */}
            <button
              onClick={handleNext}
              disabled={isLoading || !!error}
              className="p-3 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-700 disabled:opacity-50"
            >
              <SkipNextIcon fontSize="large" />
            </button>
          </div>

          {/* Seekbar */}
          <div className="mt-4">
            <Slider
              value={progress}
              onChange={handleSeekChange}
              onChangeCommitted={handleSeek}
              onMouseDown={handleSeekStart}
              disabled={isLoading || !duration || !!error}
              sx={{ color: "primary.main" }}
            />
            <div className="flex justify-between text-sm -mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Volume */}
          <div className="flex items-center justify-center mt-2 gap-2">
            <button onClick={toggleMute} disabled={isLoading || !!error}>
              {isMuted || volume === 0 ? <VolumeOffIcon /> : <VolumeUpIcon />}
            </button>
            <Slider
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              step={0.01}
              min={0}
              max={1}
              disabled={isLoading || !!error}
              sx={{ width: 150 }}
            />
          </div>

          <Typography variant="body2" className="mt-2">
            {isLoading
              ? "Loading audio stream..."
              : ""}
          </Typography>
        </CardContent>
      </Card>
    </div>
  );
}
