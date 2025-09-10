import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AudioDetails {
  title: string;
  thumbnailUrl: string;
}

interface PlayerState {
  isPlaying: boolean;
  progress: number; // 0-100
  duration: number; // seconds
  currentTime: number; // seconds
  volume: number; // 0-1
  isMuted: boolean;
  isLoading: boolean;
  error: string | null;
  isSeeking: boolean;
  audioDetails: AudioDetails | null;
}

const initialState: PlayerState = {
  isPlaying: false,
  progress: 0,
  duration: 0,
  currentTime: 0,
  volume: 1,
  isMuted: false,
  isLoading: false,
  error: null,
  isSeeking: false,
  audioDetails: null,
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setIsPlaying(state, action: PayloadAction<boolean>) {
      state.isPlaying = action.payload;
    },
    setProgress(state, action: PayloadAction<number>) {
      state.progress = action.payload;
    },
    setDuration(state, action: PayloadAction<number>) {
      state.duration = action.payload;
    },
    setCurrentTime(state, action: PayloadAction<number>) {
      state.currentTime = action.payload;
    },
    setVolume(state, action: PayloadAction<number>) {
      state.volume = action.payload;
      state.isMuted = action.payload === 0;
    },
    setIsMuted(state, action: PayloadAction<boolean>) {
      state.isMuted = action.payload;
    },
    setIsLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setIsSeeking(state, action: PayloadAction<boolean>) {
      state.isSeeking = action.payload;
    },
    setAudioDetails(state, action: PayloadAction<AudioDetails | null>) {
      state.audioDetails = action.payload;
    },
    resetPlayer(state) {
      state.isPlaying = false;
      state.progress = 0;
      state.duration = 0;
      state.currentTime = 0;
      state.error = null;
      state.isLoading = true;
      state.isSeeking = false;
    },
  },
});

export const {
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
} = playerSlice.actions;

export default playerSlice.reducer;
