const ytdl = require("@distube/ytdl-core");

export async function GET(request: Request) {
  try {
    const base = "http://localhost";
    const url = new URL(request.url, base);
    const videoId = url.searchParams.get("videoId");

    console.log("Extracted videoId:", videoId);

    if (!videoId) {
      return new Response(JSON.stringify({ error: "Missing videoId" }), { status: 400 });
    }

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    console.log("Video URL:", videoUrl);

    // Validate URL
    if (!ytdl.validateURL(videoUrl)) {
      return new Response(JSON.stringify({ error: "Invalid YouTube URL or videoId" }), { status: 400 });
    }

    // Get video info to determine content length
    const info = await ytdl.getInfo(videoUrl);
    const format = ytdl.chooseFormat(info.formats, {
      filter: "audioonly",
      quality: "highestaudio",
    });

    if (!format) {
      return new Response(JSON.stringify({ error: "No audio format found" }), { status: 404 });
    }

    const contentLength = parseInt(format.contentLength || "0");
    console.log("Content Length:", contentLength);

    // Parse Range header
    const range = request.headers.get("range");
    let start = 0;
    let end = contentLength - 1;
    let isRangeRequest = false;

    if (range && contentLength > 0) {
      isRangeRequest = true;
      const parts = range.replace(/bytes=/, "").split("-");
      start = parseInt(parts[0], 10) || 0;
      end = parts[1] ? parseInt(parts[1], 10) : contentLength - 1;

      console.log(`Range request: ${start}-${end}/${contentLength}`);

      // Validate range
      if (start >= contentLength || end >= contentLength || start > end) {
        return new Response("Range Not Satisfiable", { 
          status: 416,
          headers: {
            "Content-Range": `bytes */${contentLength}`
          }
        });
      }
    }

    // For range requests, try to use the direct URL with range headers
    if (isRangeRequest && format.url) {
      try {
        const response = await fetch(format.url, {
          headers: {
            'Range': `bytes=${start}-${end}`,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const headers: HeadersInit = {
          "Content-Type": format.mimeType || "audio/webm",
          "Accept-Ranges": "bytes",
          "Cache-Control": "no-cache",
          "Content-Length": (end - start + 1).toString(),
          "Content-Range": `bytes ${start}-${end}/${contentLength}`,
        };

        return new Response(response.body, {
          status: 206,
          headers,
        });
      } catch (error) {
        console.error("Direct fetch failed, falling back to ytdl stream:", error);
        // Fall back to regular streaming
      }
    }

    // Regular streaming (no range or fallback)
    const stream = ytdl(videoUrl, {
      filter: "audioonly",
      quality: "highestaudio",
      highWaterMark: 1 << 25,
    });

    let bytesSkipped = 0;
    let bytesServed = 0;
    const targetBytes = isRangeRequest ? end - start + 1 : contentLength;

    const webStream = new ReadableStream({
      start(controller) {
        stream.on("data", (chunk: Buffer) => {
          if (isRangeRequest) {
            // Skip bytes until we reach the start position
            if (bytesSkipped < start) {
              const skipAmount = Math.min(chunk.length, start - bytesSkipped);
              bytesSkipped += skipAmount;
              if (skipAmount === chunk.length) return;
              chunk = chunk.slice(skipAmount);
            }

            // Limit bytes to the requested range
            if (bytesServed + chunk.length > targetBytes) {
              chunk = chunk.slice(0, targetBytes - bytesServed);
            }

            bytesServed += chunk.length;
            controller.enqueue(chunk);

            // Close stream when we've served enough bytes
            if (bytesServed >= targetBytes) {
              stream.destroy();
              controller.close();
            }
          } else {
            controller.enqueue(chunk);
          }
        });

        stream.on("end", () => {
          controller.close();
        });

        stream.on("error", (err: Error) => {
          console.error("Stream error:", err);
          controller.error(err);
        });
      },
      cancel() {
        stream.destroy();
      }
    });

    // Set response headers
    const headers: HeadersInit = {
      "Content-Type": format.mimeType || "audio/webm",
      "Accept-Ranges": "bytes",
      "Cache-Control": "no-cache",
    };

    if (isRangeRequest) {
      headers["Content-Length"] = targetBytes.toString();
      headers["Content-Range"] = `bytes ${start}-${end}/${contentLength}`;

      return new Response(webStream, {
        status: 206,
        headers,
      });
    } else {
      if (contentLength > 0) {
        headers["Content-Length"] = contentLength.toString();
      }

      return new Response(webStream, {
        status: 200,
        headers,
      });
    }
  } catch (err: any) {
    console.error("API Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
}