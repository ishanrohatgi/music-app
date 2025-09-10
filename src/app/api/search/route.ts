import YTMusic from "ytmusic-api";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query) {
      return Response.json(
        { error: "Missing search query" },
        { status: 400 }
      );
    }

    const api = new YTMusic();
    await api.initialize();

    
    const searchResults = await api.search(query);

    
    const songs = searchResults
      .filter((item: any) => item.videoId) 
      .map((item: any) => ({
        title: item.name ?? item.title ?? "Unknown",
        artists: item.artist ? [item.artist] : item.artists ?? [],
        thumbnailUrl:
          item.thumbnailUrl ?? item.thumbnails?.[0]?.url ?? null,
        videoId: item.videoId,
      }));

    return Response.json(songs, { status: 200 });
  } catch (error: any) {
    console.error("Error performing search:", error);
    return Response.json(
      { error: error.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
