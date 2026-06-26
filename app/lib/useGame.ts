"use client";

import { useState, useCallback } from "react";
import { Fixture } from "./useFixtures";

export type StatType = "corners" | "goals" | "yellowCards";
export type Guess = "higher" | "lower";

export interface Round {
    fixture: Fixture;
    statType: StatType;
    statLabel: string;
    previousValue: number;
    currentValue: number | null;
    guess: Guess | null;
    result: "correct" | "wrong" | "pending";
}

const STAT_LABELS: Record<StatType, string> = {
    corners: "Total Corners",
    goals: "Total Goals",
    yellowCards: "Yellow Cards",
};

export function useGame(fixtures: Fixture[]) {
    const [round, setRound] = useState<Round | null>(null);
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const [totalGuesses, setTotalGuesses] = useState(0);
    const [correctGuesses, setCorrectGuesses] = useState(0);

    const startRound = useCallback((fixture: Fixture, initialValue?: number) => {
        const stats: StatType[] = ["corners", "goals", "yellowCards"];
        const statType = stats[Math.floor(Math.random() * stats.length)];
        const previousValue = initialValue ?? Math.floor(Math.random() * 10);

        setRound({
            fixture,
            statType,
            statLabel: STAT_LABELS[statType],
            previousValue,
            currentValue: null,
            guess: null,
            result: "pending",
        });
    }, []);

    const makeGuess = useCallback(
        (guess: Guess) => {
            if (!round || round.guess !== null) return;
            setRound((prev) => prev ? { ...prev, guess } : null);
        },
        [round]
    );

    const resolveRound = useCallback(
        (guess: Guess, newValue: number) => {
            const correct =
                (guess === "higher" && newValue > (round?.previousValue ?? 0)) ||
                (guess === "lower" && newValue < (round?.previousValue ?? 0));

            const newStreak = correct ? streak + 1 : 0;

            setStreak(newStreak);
            setBestStreak((prev) => Math.max(prev, newStreak));
            setTotalGuesses((prev) => prev + 1);
            setCorrectGuesses((prev) => correct ? prev + 1 : prev);

            setRound((prev) =>
                prev
                    ? {
                        ...prev,
                        guess,
                        currentValue: newValue,
                        result: correct ? "correct" : "wrong",
                    }
                    : null
            );
        },
        [round, streak]
    );

    const nextRound = useCallback(() => {
        if (!round) return;
        const newPreviousValue = round.currentValue ?? round.previousValue;
        const stats: StatType[] = ["corners", "goals", "yellowCards"];
        const statType = stats[Math.floor(Math.random() * stats.length)];

        setRound({
            fixture: round.fixture,
            statType,
            statLabel: STAT_LABELS[statType],
            previousValue: newPreviousValue,
            currentValue: null,
            guess: null,
            result: "pending",
        });
    }, [round]);

    return {
        round,
        streak,
        bestStreak,
        totalGuesses,
        correctGuesses,
        startRound,
        makeGuess,
        resolveRound,
        nextRound,
    };
}