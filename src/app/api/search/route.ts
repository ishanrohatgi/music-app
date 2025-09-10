import YTMusic from "ytmusic-api";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get("q");

    if (!query) {
      return Response.json(
        { error: "Missing search query parameter 'q'" },
        { status: 400 }
      );
    }

    const api = new YTMusic();
    await api.initialize();

    // Search for songs
    const searchResults = await api.search(query, "song");

    const songs = searchResults.map((item: any) => ({
      title: item.name ?? item.title ?? "Unknown",
      artists: item.artist ? [item.artist] : item.artists ?? [],
      thumbnailUrl: item.thumbnailUrl ?? item.thumbnails?.[0]?.url ?? null,
      videoId: item.videoId,
      duration: item.duration ?? null,
      album: item.album ?? null,
    }));

    return Response.json(songs, { status: 200 });
  } catch (error) {
    console.error("Error searching songs:", error);
    return Response.json(
      { error: error?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}