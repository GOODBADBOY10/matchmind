import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://txline.txodds.com";

export async function POST(request: NextRequest) {
  const { endpoint, body, jwt } = await request.json();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (jwt) headers["Authorization"] = `Bearer ${jwt}`;

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const text = await response.text();

  try {
    const data = JSON.parse(text);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ token: text.trim() });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get("endpoint")!;
  const jwt = searchParams.get("jwt");
  const apiToken = searchParams.get("apiToken");

  const headers: Record<string, string> = {};
  if (jwt) headers["Authorization"] = `Bearer ${jwt}`;
  if (apiToken) headers["X-Api-Token"] = apiToken;

  const response = await fetch(`${BASE_URL}${endpoint}`, { headers });

  const text = await response.text();

  try {
    const data = JSON.parse(text);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ token: text.trim() });
  }
}