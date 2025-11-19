// app/api/validate-url/route.ts
import { NextResponse } from "next/server";

const DEFAULT_TIMEOUT = 5000;

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        { ok: false, message: "Missing url" },
        { status: 400 }
      );
    }

    // Validate URL format
    let parsed: URL;
    try {
      parsed = new URL(url);
      if (parsed.protocol !== "https:") {
        return NextResponse.json(
          { ok: false, message: "Only https:// is allowed" },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { ok: false, message: "Invalid URL" },
        { status: 400 }
      );
    }

    // Create timeout controller
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

    let response: Response | null = null;

    try {
      // Try HEAD first
      try {
        response = await fetch(url, {
          method: "HEAD",
          redirect: "follow",
          signal: controller.signal,
          headers: { "User-Agent": "MyApp/1.0" },
        });
      } catch {
        // Fallback to GET (because many servers block HEAD)
        response = await fetch(url, {
          method: "GET",
          redirect: "follow",
          signal: controller.signal,
          headers: { "User-Agent": "MyApp/1.0" },
        });
      }
    } finally {
      clearTimeout(timeout);
    }

    if (response && response.status >= 200 && response.status < 400) {
      return NextResponse.json({
        ok: true,
        status: response.status,
        finalUrl: response.url,
      });
    } else {
      return NextResponse.json(
        {
          ok: false,
          status: response?.status ?? null,
          message: `Unreachable (status ${response?.status ?? "unknown"})`,
        },
        { status: 422 }
      );
    }
  } catch (err: any) {
    if (err.name === "AbortError") {
      return NextResponse.json(
        { ok: false, message: "Request timed out" },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { ok: false, message: "Unreachable domain.", status: 500 },
      { status: 500 }
    );
  }
}
