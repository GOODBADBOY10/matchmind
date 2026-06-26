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

export default function Home() {
  const { jwt } = useAppStore();
  const { fixtures, loading } = useFixtures();
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null);

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
        const newValue = statMap[round.statType] ?? Math.floor(Math.random() * 10);
        resolveRound(guess, newValue);
      } else {
        resolveRound(guess, Math.floor(Math.random() * 10));
      }
    }, 3000);
  };

  const handleBack = () => {
    setGameStarted(false);
    setSelectedFixture(null);
    resetGame();
  };

  // const isLive = scores &&
  //   scores.gameState !== "scheduled" &&
  //   scores.gameState !== "NS";

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
            <div className="mb-8">
              <h2 className="text-3xl font-black mb-2">Pick a Match</h2>
              <p className="text-gray-500">Choose a World Cup fixture to predict</p>
            </div>
            {loading && (
              <div className="flex flex-col gap-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-gray-900 rounded-2xl p-5 animate-pulse h-20" />
                ))}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {fixtures.slice(0, 12).map((f) => (
                <button
                  key={f.FixtureId}
                  onClick={() => handleSelectFixture(f)}
                  className="bg-gray-900 hover:bg-gray-800 cursor-pointer border border-white/5 hover:border-green-400/30 rounded-2xl p-5 flex flex-col gap-2 transition-all text-left group"
                >
                  <p className="text-xs text-gray-500 uppercase tracking-widest">
                    {f.Competition}
                  </p>
                  <p className="font-bold text-white group-hover:text-green-400 transition-colors">
                    {f.Participant1}
                  </p>
                  <p className="text-gray-500 text-sm">vs</p>
                  <p className="font-bold text-white group-hover:text-green-400 transition-colors">
                    {f.Participant2}
                  </p>
                  <span className="text-green-400 text-xs mt-1">Play →</span>
                </button>
              ))}
            </div>
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
            {scores && (
              <div className="bg-gray-900 border border-white/5 rounded-2xl p-4 mb-4 flex flex-wrap justify-between items-center gap-2">
                <div className="flex gap-4 text-sm">
                  <span>⚽ <span className="font-bold text-white">{scores.total.Goals}</span> <span className="text-gray-500">goals</span></span>
                  <span>🚩 <span className="font-bold text-white">{scores.total.Corners}</span> <span className="text-gray-500">corners</span></span>
                  <span>🟨 <span className="font-bold text-white">{scores.total.YellowCards}</span> <span className="text-gray-500">cards</span></span>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${isLive
                  ? "bg-green-400/20 text-green-400"
                  : isFinished
                    ? "bg-blue-400/20 text-blue-400"
                    : "bg-gray-800 text-gray-400"
                  }`}>
                  {isLive ? "🔴 Live" : isFinished ? "✓ Finished" : "Upcoming"}
                </span>
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