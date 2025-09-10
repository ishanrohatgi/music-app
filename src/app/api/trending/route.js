import YTMusic from "ytmusic-api";

let cachedSongs = null;
let cacheTimestamp = 0;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export async function GET() {
  try {
    // Serve from cache if still valid
    if (cachedSongs && Date.now() - cacheTimestamp < CACHE_TTL) {
      return Response.json(cachedSongs, { status: 200 });
    }

    const api = new YTMusic();
    await api.initialize();

    const sections = await api.getHomeSections();

    const allSongs = [];
    const playlistPromises = [];

    for (const section of sections) {
      if (!section?.contents) continue;

      for (const item of section.contents) {
        if (!item) continue;

        // Direct video items
        if (item.videoId) {
          allSongs.push({
            title: item.name ?? item.title ?? "Unknown",
            artists: item.artist ? [item.artist] : item.artists ?? [],
            thumbnailUrl: item.thumbnailUrl ?? item.thumbnails?.[0]?.url ?? null,
            videoId: item.videoId,
          });
        }

        // Playlist items (fetch in parallel)
        else if (item.playlistId) {
          // Skip auto-generated / unsupported playlists
          if (
            item.playlistId.startsWith("RD") ||
            item.playlistId.startsWith("OL")
          ) {
            console.warn(`Skipping unsupported playlist ${item.playlistId}`);
            continue;
          }

          playlistPromises.push(
            api
              .getPlaylist(item.playlistId)
              .then((playlist) => {
                if (!playlist?.videos?.length) return;

                // Take only first 10 videos for performance
                playlist.videos.slice(0, 10).forEach((video) => {
                  if (!video?.videoId) return;

                  allSongs.push({
                    title: video.name ?? video.title ?? "Unknown",
                    artists: video.artist ? [video.artist] : video.artists ?? [],
                    thumbnailUrl:
                      video.thumbnailUrl ?? video.thumbnails?.[0]?.url ?? null,
                    videoId: video.videoId,
                  });
                });
              })
              .catch((err) => {
                console.warn(`Skipping playlist ${item.playlistId}:`, err.message);
              })
          );
        }
      }
    }

    // Wait for all playlists in parallel
    await Promise.all(playlistPromises);

    // Update cache
    cachedSongs = allSongs;
    cacheTimestamp = Date.now();

    return Response.json(allSongs, { status: 200 });
  } catch (error) {
    console.error("Error fetching trending songs:", error);
    return Response.json(
      { error: error.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
