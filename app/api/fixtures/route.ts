import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://txline.txodds.com";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jwt = searchParams.get("jwt")!;
  const apiToken = searchParams.get("apiToken")!;

  console.log("Calling TxLINE fixtures with apiToken:", apiToken.slice(0, 20));

  const response = await fetch(`${BASE_URL}/api/fixtures/snapshot`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
      "X-Api-Token": apiToken,
    },
  });

  console.log("TxLINE response status:", response.status);
  const text = await response.text();
  console.log("TxLINE response body:", text.slice(0, 300));

  if (!response.ok) {
    return NextResponse.json({ error: text, status: response.status }, { status: response.status });
  }

  try {
    const data = JSON.parse(text);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: text });
  }
}