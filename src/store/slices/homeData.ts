import { createSlice } from "@reduxjs/toolkit";

const initialState = { 
  trendingSongs: [],
  searchTerm: "",
  searchResults: [],          // Fixed camelCase
  isSearching: false,
  isLoadingTrending: true,
  history: JSON.parse(localStorage.getItem("history")) || []
};

const homeSlice = createSlice({
  name: "home",
  initialState,
  reducers: {
    setTrendingSongs: (state, action) => { state.trendingSongs = action.payload },
    setSearchTerm: (state, action) => { state.searchTerm = action.payload },
    setIsSearching: (state, action) => { state.isSearching = action.payload },
    setSearchResults: (state, action) => { state.searchResults = action.payload },   // Fixed camelCase
    setIsLoadingTrending: (state, action) => { state.isLoadingTrending = action.payload },
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

  localStorage.setItem("history", JSON.stringify(state.history));
}
    
  },
});

export const { setTrendingSongs, setSearchTerm, setSearchResults, setIsSearching, setIsLoadingTrending, setHistory } = homeSlice.actions;
export default homeSlice.reducer;
