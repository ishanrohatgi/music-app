"use client";

import Image from "next/image";
import { Card, CardContent, CardMedia, Typography, IconButton } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector} from "react-redux";
import { setHistory } from "@/store/slices/homeData";
export default function MusicCard({ item }: { item: any }) {
  const router = useRouter();
  const dispatch = useDispatch()

  const handlePlay = () => {
    sessionStorage.setItem("audioDetails", JSON.stringify(item));
    dispatch(setHistory(item))
    // Redirect to player route with videoId
    router.push(`/player/${item.videoId}`);
  };

  return (
    <Card
      sx={{
        width: 250,
        maxWidth: 250,
        borderRadius: 3,
        boxShadow: 3,
        margin: "auto",
      }}
    >
      {/* Thumbnail */}
      {item.thumbnailUrl && (
        <CardMedia sx={{ height: 200, position: "relative" }}>
          <Image
            src={item.thumbnailUrl}
            alt={item.title}
            fill
            style={{ objectFit: "cover", borderRadius: "12px 12px 0 0" }}
          />
        </CardMedia>
      )}

      {/* Content */}
      <CardContent sx={{ textAlign: "center" }}>
        <Typography variant="subtitle1" fontWeight={600} noWrap>
          {item.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40 }}>
          {item.artists?.map((a: any) => a.name ?? a).join(", ")}
        </Typography>

        {/* Play button */}
        <IconButton
          color="primary"
          onClick={handlePlay}
          sx={{ mt: 1, bgcolor: "primary.main", color: "white", "&:hover": { bgcolor: "primary.dark" } }}
        >
          <PlayArrowIcon />
        </IconButton>
      </CardContent>
    </Card>
  );
}
