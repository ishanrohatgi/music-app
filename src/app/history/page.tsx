"use client";
import { useEffect, useState } from "react";
import { Box, Typography, Grid } from "@mui/material";
import MusicCard from "@/components/MusicCard";

export default function History() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("history");
    if (stored) {
      setHistory(JSON.parse(stored));
    }
  }, []);

  return (
    <div className="mt-[80px]">
      <Box>
        <Typography
          variant="h6"
          sx={{ mb: 2, color: history.length ? "secondary.main" : "primary.main" }}
        >
          {history.length
            ? `📜 Your History (${history.length})`
            : "No History Found"}
        </Typography>

        <Grid container spacing={2} justifyContent="center">
          {history.map((item, i) => (
          
              <MusicCard item={item} />
          ))}
        </Grid>
      </Box>
    </div>
  );
}
