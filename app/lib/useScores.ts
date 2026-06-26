"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppStore } from "./store";
import axios from "axios";

export interface SoccerScore {
  Goals: number;
  Corners: number;
  YellowCards: number;
  RedCards: number;
}

export interface MatchScores {
  participant1: SoccerScore;
  participant2: SoccerScore;
  total: SoccerScore;
  gameState: string;
  minute: number;
}

export function useScores(fixtureId: number | null) {
  const { jwt, apiToken } = useAppStore();
  const [scores, setScores] = useState<MatchScores | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScores = useCallback(async (): Promise<MatchScores | null> => {
    if (!jwt || !apiToken || !fixtureId) return null;

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get("/api/scores", {
        params: { jwt, apiToken, fixtureId },
      });

      const data = response.data;

      if (!Array.isArray(data) || data.length === 0) {
        setScores(null);
        return null;
      }

      // Find the event with the highest total goals (most up to date score)
      let best = data[0];
      let bestGoals = 0;

      for (const event of data) {
        const s = event.Score ?? event.scoreSoccer;
        if (!s) continue;
        const p1 = s.Participant1?.Total ?? {};
        const p2 = s.Participant2?.Total ?? {};
        const totalGoals = (p1.Goals ?? 0) + (p2.Goals ?? 0);
        const totalCorners = (p1.Corners ?? 0) + (p2.Corners ?? 0);
        const totalCards = (p1.YellowCards ?? 0) + (p2.YellowCards ?? 0);
        const total = totalGoals + totalCorners + totalCards;
        if (total >= bestGoals) {
          bestGoals = total;
          best = event;
        }
      }

      const latest = best;
      const score = latest.Score ?? latest.scoreSoccer;
      // const gameState = latest.GameState ?? latest.gameState ?? "NS";
      const startTime = latest.StartTime ?? 0;
      const now = Date.now();
      // World Cup matches last ~2 hours (7200000ms)
      const matchEndTime = startTime + 7200000;
      const gameState = now < startTime ? "upcoming" : now > matchEndTime ? "finished" : "live";
      const minute = latest.Clock?.Seconds
        ? Math.floor(latest.Clock.Seconds / 60)
        : 0;

      let newScores: MatchScores;

      if (score) {
        const p1 = score.Participant1?.Total ?? { Goals: 0, Corners: 0, YellowCards: 0, RedCards: 0 };
        const p2 = score.Participant2?.Total ?? { Goals: 0, Corners: 0, YellowCards: 0, RedCards: 0 };

        newScores = {
          participant1: p1,
          participant2: p2,
          total: {
            Goals: (p1.Goals ?? 0) + (p2.Goals ?? 0),
            Corners: (p1.Corners ?? 0) + (p2.Corners ?? 0),
            YellowCards: (p1.YellowCards ?? 0) + (p2.YellowCards ?? 0),
            RedCards: (p1.RedCards ?? 0) + (p2.RedCards ?? 0),
          },
          gameState,
          minute,
        };
      } else {
        newScores = {
          participant1: { Goals: 0, Corners: 0, YellowCards: 0, RedCards: 0 },
          participant2: { Goals: 0, Corners: 0, YellowCards: 0, RedCards: 0 },
          total: { Goals: 0, Corners: 0, YellowCards: 0, RedCards: 0 },
          gameState,
          minute: 0,
        };
      }

      setScores(newScores);
      return newScores;

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch scores");
      return null;
    } finally {
      setLoading(false);
    }
  }, [jwt, apiToken, fixtureId]);

  useEffect(() => {
    if (!fixtureId) return;
    fetchScores();
    const interval = setInterval(fetchScores, 30000);
    return () => clearInterval(interval);
  }, [fixtureId, fetchScores]);

  return { scores, loading, error, refetch: fetchScores };
}