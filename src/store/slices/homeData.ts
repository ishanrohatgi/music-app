import { createSlice } from "@reduxjs/toolkit";

// Helper to safely load history from localStorage
const loadHistory = () => {
  if (typeof window === "undefined") return []; // SSR safety
  try {
    const stored = localStorage.getItem("history");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const initialState = { 
  trendingSongs: [],
  searchTerm: "",
  searchResults: [],
  isSearching: false,
  isLoadingTrending: true,
  history: loadHistory(), // SSR-safe
};

const homeSlice = createSlice({
  name: "home",
  initialState,
  reducers: {
    setTrendingSongs: (state, action) => {
      state.trendingSongs = action.payload;
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setIsSearching: (state, action) => {
      state.isSearching = action.payload;
    },
    setSearchResults: (state, action) => {
      state.searchResults = action.payload;
    },
    setIsLoadingTrending: (state, action) => {
      state.isLoadingTrending = action.payload;
    },
    setHistory: (state, action) => {
      const itemIndex = state.history.findIndex(
        (item: any) => item.videoId === action.payload.videoId
      );

      if (itemIndex === -1) {
        state.history.push({ ...action.payload, lastWatched: Date.now() });
      } else {
        state.history[itemIndex] = {
          ...state.history[itemIndex],
          lastWatched: Date.now(),
        };
      }

      state.history.sort((a, b) => b.lastWatched - a.lastWatched);

      if (typeof window !== "undefined") {
        localStorage.setItem("history", JSON.stringify(state.history));
      }
    },
  },
});

export const { setTrendingSongs, setSearchTerm, setSearchResults, setIsSearching, setIsLoadingTrending, setHistory } = homeSlice.actions;
export default homeSlice.reducer;
