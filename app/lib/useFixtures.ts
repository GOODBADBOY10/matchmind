"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "./store";
import axios from "axios";

export interface Fixture {
  FixtureId: number;
  Participant1: string;
  Participant2: string;
  StartTime: number;
  Competition: string;
  GameState?: string;
}

export function useFixtures() {
  const { jwt, apiToken } = useAppStore();
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jwt || !apiToken) return;

    const fetchFixtures = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get("/api/fixtures", {
          params: { jwt, apiToken },
        });

        const data = response.data;
        console.log("Fixtures response:", data);
        setFixtures(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch fixtures");
      } finally {
        setLoading(false);
      }
    };

    fetchFixtures();
  }, [jwt, apiToken]);

  return { fixtures, loading, error };
}