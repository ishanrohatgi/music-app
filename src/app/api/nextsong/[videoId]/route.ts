import { NextResponse } from "next/server";
import YTMusic from "ytmusic-api";

const ytmusic = new YTMusic();
await ytmusic.initialize();

export async function GET(
  req: Request,
  context: { params: Promise<{ videoId: string }> }
) {
  try {
    // ✅ Await params (App Router requirement)
    const { videoId } = await context.params;

    const related = await ytmusic.getUpNexts(videoId);

    // ✅ Normalize structure & handle artists safely
    const songs = related.map((track: any) => ({
      id: track.videoId,
      title: track.title,
      artist: track.artists,
      thumbnail: track.thumbnail || "",
      duration: track.duration || ""
    }));
    return NextResponse.json(songs);
  } catch (error) {
    console.error("Next song fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch next songs" },
      { status: 500 }
    );
  }
}
