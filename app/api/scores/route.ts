import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://txline.txodds.com";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jwt = searchParams.get("jwt")!;
  const apiToken = searchParams.get("apiToken")!;
  const fixtureId = searchParams.get("fixtureId")!;

  const response = await fetch(
    `${BASE_URL}/api/scores/snapshot/${fixtureId}`,
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
        "X-Api-Token": apiToken,
      },
    }
  );

  const text = await response.text();
  console.log("Scores status:", response.status);
  console.log("Scores response:", text.slice(0, 300));

  try {
    const data = JSON.parse(text);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: text, status: response.status });
  }
}