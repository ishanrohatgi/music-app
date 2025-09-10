"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import Grid from "@mui/material/Unstable_Grid2"; // ✅ use Grid2
import MusicCard from "@/components/MusicCard";
import { Typography, Box } from "@mui/material";

export default function HistoryPage() {
  const history = useSelector((state: RootState) => state.home.history);

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h5"
        sx={{ mb: 2, textAlign: "center", fontWeight: "bold" }}
      >
        Your Watch History 🎵
      </Typography>

      {history.length === 0 ? (
        <Typography sx={{ textAlign: "center", mt: 4 }}>
          No history found yet. Start playing some music!
        </Typography>
      ) : (
        <Grid container spacing={2} justifyContent="center">
          {history.map((item, i) => (
            <Grid xs={12} sm={6} md={4} lg={3} key={i}>
              <MusicCard item={item} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
