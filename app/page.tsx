"use client";

import { useEffect, useState } from "react";
import { ConnectButton } from "./components/ConnectButton";
import { GameCard } from "./components/GameCard";
import { useFixtures, Fixture } from "./lib/useFixtures";
import { useGame } from "./lib/useGame";
import { useScores } from "./lib/useScores";
import { useAppStore } from "./lib/store";
import { ShareButton } from "./components/ShareButton";
import { StreakBadge } from "./components/StreakBadge";
import { ProBanner } from "./components/ProBanner";

export default function Home() {
  const { jwt } = useAppStore();
  const { fixtures, loading } = useFixtures();
  const [gameStarted, setGameStarted] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null);

  type FilterType = "all" | "live" | "upcoming" | "finished";
  const [filter, setFilter] = useState<FilterType>("all");

  const sortedFixtures = [...fixtures].sort((a, b) => {
    const now = Date.now();
    const getStatus = (f: Fixture) => {
      const matchEnd = f.StartTime + 7200000;
      if (now >= f.StartTime && now <= matchEnd) return 0; // live first
      if (now < f.StartTime) return 1; // upcoming second
      return 2; // finished last
    };
    return getStatus(a) - getStatus(b);
  });

  const filteredFixtures = sortedFixtures.filter((f) => {
    if (filter === "all") return true;
    const now = Date.now();
    const matchEnd = f.StartTime + 7200000;
    if (filter === "live") return now >= f.StartTime && now <= matchEnd;
    if (filter === "upcoming") return now < f.StartTime;
    if (filter === "finished") return now > matchEnd;
    return true;
  });

  const {
    round,
    streak,
    bestStreak,
    totalGuesses,
    correctGuesses,
    startRound,
    makeGuess,
    resolveRound,
    nextRound,
    resetGame,
  } = useGame(fixtures);

  const { scores, refetch } = useScores(selectedFixture?.FixtureId ?? null);

  useEffect(() => {
    if (gameStarted && selectedFixture && scores && !round) {
      const statType = ["corners", "goals", "yellowCards"][
        Math.floor(Math.random() * 3)
      ] as "corners" | "goals" | "yellowCards";
      const statMap = {
        corners: scores.total.Corners,
        goals: scores.total.Goals,
        yellowCards: scores.total.YellowCards,
      };
      startRound(selectedFixture, statMap[statType]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scores]);

  const handleSelectFixture = (fixture: Fixture) => {
    setSelectedFixture(null);
    resetGame();
    setTimeout(() => {
      setSelectedFixture(fixture);
      setGameStarted(true);
    }, 100);
  };

  const handleGuess = (guess: "higher" | "lower") => {
    makeGuess(guess);
    setTimeout(async () => {
      const freshScores = await refetch();
      if (freshScores && round) {
        const statMap: Record<string, number> = {
          corners: freshScores.total.Corners,
          goals: freshScores.total.Goals,
          yellowCards: freshScores.total.YellowCards,
        };
        const newValue = statMap[round.statType] ?? 0;
        // If match not started yet, use random to keep game fun
        const isUpcoming = freshScores.gameState === "upcoming" ||
          (freshScores.total.Goals === 0 &&
            freshScores.total.Corners === 0 &&
            freshScores.total.YellowCards === 0);
        const resolvedValue = isUpcoming
          ? Math.floor(Math.random() * 8)
          : newValue;
        resolveRound(guess, resolvedValue);
      } else {
        resolveRound(guess, Math.floor(Math.random() * 8));
      }
    }, 3000);
  };

  const handleBack = () => {
    setGameStarted(false);
    setSelectedFixture(null);
    resetGame();
  };

  const isLive = scores?.gameState === "live";
  const isFinished = scores?.gameState === "finished";

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-black tracking-tight">
            Match<span className="text-green-400">Mind</span>
          </h1>
          <ConnectButton />
        </div>
      </nav>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-12">

        {/* Hero — shown when not connected */}
        {!jwt && (
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8 text-center animate-fadeIn">
            <div className="inline-flex items-center gap-2 bg-green-400/10 border border-green-400/20 text-green-400 text-xs font-semibold px-4 py-2 rounded-full">
              ⚽ World Cup 2026 · Live Data
            </div>
            <div>
              <h2 className="text-5xl sm:text-7xl font-black tracking-tight mb-4 leading-none">
                Predict.<br />
                <span className="text-green-400">Streak.</span><br />
                Win.
              </h2>
              <p className="text-gray-400 text-lg sm:text-xl max-w-md mx-auto">
                Guess if live World Cup stats go higher or lower.
                Powered by real-time TxLINE data on Solana.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-center">
              <div className="bg-gray-900 rounded-2xl px-6 py-4">
                <p className="text-3xl font-black text-green-400">104</p>
                <p className="text-gray-500 text-sm mt-1">Matches</p>
              </div>
              <div className="bg-gray-900 rounded-2xl px-6 py-4">
                <p className="text-3xl font-black text-green-400">Live</p>
                <p className="text-gray-500 text-sm mt-1">Real-Time Data</p>
              </div>
              <div className="bg-gray-900 rounded-2xl px-6 py-4">
                <p className="text-3xl font-black text-green-400">Free</p>
                <p className="text-gray-500 text-sm mt-1">To Play</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              Connect your Solana wallet to start playing
            </p>
          </div>
        )}

        {/* Fixture picker */}
        {jwt && !gameStarted && (
          <div className="animate-fadeIn">
            <div className="mb-6">
              <h2 className="text-3xl font-black mb-2">Pick a Match</h2>
              <p className="text-gray-500">Choose a World Cup fixture to predict</p>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 mb-6">
              {(["all", "live", "upcoming", "finished"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => { setFilter(f); setVisibleCount(12); }}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all capitalize ${filter === f
                    ? "bg-green-400 text-black"
                    : "bg-gray-900 text-gray-400 hover:text-white border border-white/5"
                    }`}
                >
                  {f === "live" ? "🔴 Live" : f === "upcoming" ? "⏳ Upcoming" : f === "finished" ? "✓ Finished" : "All"}
                </button>
              ))}
            </div>

            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-900 rounded-2xl p-5 animate-pulse h-32" />
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredFixtures.slice(0, visibleCount).map((f) => {
                const now = Date.now();
                const matchEnd = f.StartTime + 7200000;
                const status = now < f.StartTime ? "upcoming" : now > matchEnd ? "finished" : "live";

                return (
                  <button
                    key={f.FixtureId}
                    onClick={() => handleSelectFixture(f)}
                    className="bg-gray-900 hover:bg-gray-800 cursor-pointer border border-white/5 hover:border-green-400/30 rounded-2xl p-5 flex flex-col gap-2 transition-all text-left group"
                  >
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500 uppercase tracking-widest">
                        {f.Competition}
                      </p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${status === "live"
                        ? "bg-green-400/20 text-green-400"
                        : status === "finished"
                          ? "bg-blue-400/20 text-blue-400"
                          : "bg-gray-800 text-gray-500"
                        }`}>
                        {status === "live" ? "🔴 Live" : status === "finished" ? "✓ Done" : "⏳"}
                      </span>
                    </div>
                    <p className="font-bold text-white group-hover:text-green-400 transition-colors">
                      {f.Participant1}
                    </p>
                    <p className="text-gray-500 text-sm">vs</p>
                    <p className="font-bold text-white group-hover:text-green-400 transition-colors">
                      {f.Participant2}
                    </p>
                    <span className="text-green-400 text-xs mt-1">Play →</span>
                  </button>
                );
              })}
            </div>

            {filteredFixtures.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-gray-500">No {filter} matches right now</p>
              </div>
            )}

            {filteredFixtures.length > visibleCount && (
              <button
                onClick={() => setVisibleCount((prev) => prev + 12)}
                className="w-full mt-4 bg-gray-900 hover:bg-gray-800 border border-white/5 text-gray-400 hover:text-white font-bold py-4 rounded-2xl transition-all"
              >
                Load More ({filteredFixtures.length - visibleCount} remaining)
              </button>
            )}
          </div>
        )}

        {/* Game */}
        {jwt && gameStarted && round && (
          <div className="animate-fadeIn max-w-lg mx-auto">
            <button
              onClick={handleBack}
              className="text-gray-500 hover:text-white text-sm transition-all mb-6 flex items-center gap-2"
            >
              ← Back to matches
            </button>

            {/* Live stats bar */}
            {scores && round && (
              <div className="bg-gray-900 border border-white/5 rounded-2xl p-4 mb-4 flex flex-col gap-3">
                {/* Match header */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-black text-sm">{round.fixture.Participant1}</p>
                    <span className="text-gray-500 text-xs">vs</span>
                    <p className="text-white font-black text-sm">{round.fixture.Participant2}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {scores.minute > 0 && (
                      <span className="text-gray-400 text-xs">⏱️ {scores.minute}'</span>
                    )}
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${isLive
                        ? "bg-green-400/20 text-green-400"
                        : isFinished
                          ? "bg-blue-400/20 text-blue-400"
                          : "bg-gray-800 text-gray-400"
                      }`}>
                      {isLive ? "🔴 Live" : isFinished ? "✓ Finished" : "Upcoming"}
                    </span>
                  </div>
                </div>

                {/* Score */}
                <div className="flex justify-center items-center gap-4 py-2">
                  <span className="text-4xl font-black text-white">{scores.participant1.Goals ?? 0}</span>
                  <span className="text-gray-600 text-xl">—</span>
                  <span className="text-4xl font-black text-white">{scores.participant2.Goals ?? 0}</span>
                </div>

                {/* Per team stats */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="flex flex-col gap-1">
                    <span className="text-white font-bold">{scores.participant1.Corners ?? 0}</span>
                    <span className="text-gray-500">🚩 Corners</span>
                    <span className="text-white font-bold">{scores.participant2.Corners ?? 0}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-white font-bold">{scores.participant1.YellowCards ?? 0}</span>
                    <span className="text-gray-500">🟨 Yellow</span>
                    <span className="text-white font-bold">{scores.participant2.YellowCards ?? 0}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-white font-bold">{scores.participant1.RedCards ?? 0}</span>
                    <span className="text-gray-500">🟥 Red</span>
                    <span className="text-white font-bold">{scores.participant2.RedCards ?? 0}</span>
                  </div>
                </div>
              </div>
            )}

            <GameCard
              round={round}
              streak={streak}
              bestStreak={bestStreak}
              onGuess={handleGuess}
              onNext={nextRound}
            />

            {/* Stats bar */}
            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <div className="bg-gray-900 rounded-2xl p-4">
                <p className="text-2xl font-black text-white">{totalGuesses}</p>
                <p className="text-gray-500 text-xs mt-1">Guesses</p>
              </div>
              <div className="bg-gray-900 rounded-2xl p-4">
                <p className="text-2xl font-black text-green-400">
                  {totalGuesses > 0
                    ? Math.round((correctGuesses / totalGuesses) * 100)
                    : 0}%
                </p>
                <p className="text-gray-500 text-xs mt-1">Accuracy</p>
              </div>
              <div className="bg-gray-900 rounded-2xl p-4">
                <p className="text-2xl font-black text-yellow-400">{bestStreak}</p>
                <p className="text-gray-500 text-xs mt-1">Best Streak</p>
              </div>
            </div>
            <StreakBadge streak={streak} bestStreak={bestStreak} />
            <ProBanner totalGuesses={totalGuesses} />
            <ShareButton
              streak={streak}
              bestStreak={bestStreak}
              totalGuesses={totalGuesses}
              correctGuesses={correctGuesses}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 text-center text-gray-600 text-xs">
        Powered by TxLINE · Built on Solana
      </footer>
    </main>
  );
}