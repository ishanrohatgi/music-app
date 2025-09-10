"use client";

import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { useEffect, useCallback } from "react";
import MusicCard from "./MusicCard";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { debounce } from "lodash";
import { setTrendingSongs, setSearchTerm, setIsLoadingTrending, setIsSearching, setSearchResults } from "@/store/slices/homeData";
import { useSelector, useDispatch } from "react-redux";

interface Song {
  title: string;
  artists: any[];
  thumbnailUrl: string | null;
  videoId: string;
  duration?: string | null;
  album?: string | null;
}

export default function SearchBar() {
  const dispatch = useDispatch();
  const trendingSongs: Song[] = useSelector((state: any) => state.home.trendingSongs);
  const searchResults: Song[] = useSelector((state: any) => state.home.searchResults);
  const searchTerm: string = useSelector((state: any) => state.home.searchTerm);
  const isSearching: boolean = useSelector((state: any) => state.home.isSearching);
  const isLoadingTrending: boolean = useSelector((state: any) => state.home.isLoadingTrending);

  useEffect(() => {
    dispatch(setIsLoadingTrending(true));
    fetch("/api/trending")
      .then((res) => res.json())
      .then((data) => {
        dispatch(setTrendingSongs(data));
        dispatch(setIsLoadingTrending(false));
      })
      .catch((err) => {
        console.error("Error loading trending songs:", err);
        dispatch(setIsLoadingTrending(false));
      });
  }, [dispatch]);

  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        dispatch(setSearchResults([]));
        dispatch(setIsSearching(false));
        return;
      }
      try {
        dispatch(setIsSearching(true));
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        if (response.ok) {
          dispatch(setSearchResults(data));
        } else {
          console.error("Search error:", data.error);
          dispatch(setSearchResults([]));
        }
      } catch (error) {
        console.error("Search error:", error);
        dispatch(setSearchResults([]));
      } finally {
        dispatch(setIsSearching(false));
      }
    }, 500),
    [dispatch]
  );

  const handleSearchChange = (value: string) => {
    dispatch(setSearchTerm(value));
    if (value.trim()) {
      debouncedSearch(value);
    } else {
      dispatch(setSearchResults([]));
      dispatch(setIsSearching(false));
    }
  };

  const filteredTrendingSongs = trendingSongs.filter((song) =>
    song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.artists.some((artist: any) =>
      (typeof artist === "string" ? artist : artist.name)
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
  );

  const combinedSongs = searchTerm.trim()
    ? [
        ...searchResults,
        ...filteredTrendingSongs.filter(trending =>
          !searchResults.some(search => search.videoId === trending.videoId)
        )
      ]
    : trendingSongs;

  const autocompleteOptions = [
    ...trendingSongs.map(song => song.title),
    ...searchResults.map(song => song.title),
  ].filter((value, index, self) => self.indexOf(value) === index);

  return (
    <div style={{ width: "95%", margin: "auto" }}>
      <Box sx={{ mb: 3 }}>
        <Autocomplete
          freeSolo
          disablePortal
          options={autocompleteOptions}
          sx={{ width: "100%" }}
          inputValue={searchTerm}
          onInputChange={(_, value) => handleSearchChange(value || "")}
          renderInput={(params) => (
            <TextField 
              {...params} 
              label="Search Song" 
              placeholder="Search for any song..."
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {isSearching && <CircularProgress size={20} />}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
        <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
          {!searchTerm && (
            <Chip 
              label="Showing Trending Songs" 
              color="primary" 
              variant="outlined" 
              size="small" 
            />
          )}
          {searchTerm && searchResults.length > 0 && (
            <Chip 
              label={`${searchResults.length} search results`} 
              color="success" 
              variant="outlined" 
              size="small" 
            />
          )}
          {searchTerm && filteredTrendingSongs.length > 0 && (
            <Chip 
              label={`${filteredTrendingSongs.length} from trending`} 
              color="secondary" 
              variant="outlined" 
              size="small" 
            />
          )}
        </Box>
      </Box>

      {isLoadingTrending && !searchTerm && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading trending songs...</Typography>
        </Box>
      )}

      {!isLoadingTrending && (
        <>
          {searchTerm && searchResults.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, color: "success.main" }}>
                🔍 Search Results ({searchResults.length})
              </Typography>
              <Grid container spacing={2} justifyContent="center">
                {searchResults.map((item) => (
                  <MusicCard key={item.videoId} item={item} />
                ))}
              </Grid>
            </Box>
          )}

          {(!searchTerm || filteredTrendingSongs.length > 0) && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, color: searchTerm ? "secondary.main" : "primary.main" }}>
                {searchTerm 
                  ? `🎵 From Trending (${filteredTrendingSongs.length})`
                  : `🔥 Trending Songs (${trendingSongs.length})`
                }
              </Typography>
              <Grid container spacing={2} justifyContent="center">
                {(searchTerm ? filteredTrendingSongs : trendingSongs).map((item) => (
                  <MusicCard key={item.videoId} item={item} />
                ))}
              </Grid>
            </Box>
          )}

          {searchTerm && searchResults.length === 0 && filteredTrendingSongs.length === 0 && !isSearching && (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No songs found for "{searchTerm}"
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Try a different search term or browse trending songs
              </Typography>
            </Box>
          )}
        </>
      )}
    </div>
  );
}
