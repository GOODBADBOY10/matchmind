"use client";

import { Round, Guess } from "../lib/useGame";

interface Props {
  round: Round;
  streak: number;
  bestStreak: number;
  onGuess: (guess: Guess) => void;
  onNext: () => void;
}

export function GameCard({ round, streak, bestStreak, onGuess, onNext }: Props) {
  const isPending = round.result === "pending";
  const isCorrect = round.result === "correct";
  const hasGuessed = round.guess !== null;

  return (
    <div className={`w-full flex flex-col gap-4 animate-fadeIn ${
      !isPending && !isCorrect ? "animate-shake" : ""
    }`}>
      {/* Streak bar */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          <div>
            <p className="text-xs text-gray-500">Current Streak</p>
            <p className="text-xl font-black text-white">{streak}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Best Streak</p>
          <p className="text-xl font-black text-yellow-400">{bestStreak}</p>
        </div>
      </div>

      {/* Main card */}
      <div className="bg-gray-900 border border-white/5 rounded-3xl overflow-hidden">
        {/* Match header */}
        <div className="bg-gray-800/50 px-6 py-4 text-center border-b border-white/5">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
            {round.fixture.Competition}
          </p>
          <p className="font-black text-lg">
            {round.fixture.Participant1}{" "}
            <span className="text-green-400">vs</span>{" "}
            {round.fixture.Participant2}
          </p>
        </div>

        {/* Stat display */}
        <div className="px-6 py-8 text-center">
          <p className="text-gray-400 text-sm uppercase tracking-widest mb-4">
            {round.statLabel}
          </p>
          <div className="relative inline-block">
            <p className="text-8xl font-black text-white leading-none">
              {round.previousValue}
            </p>
          </div>

          {/* Result */}
          {round.currentValue !== null && (
            <div className={`mt-6 p-4 rounded-2xl ${
              isCorrect
                ? "bg-green-400/10 border border-green-400/30"
                : "bg-red-500/10 border border-red-500/30"
            }`}>
              <p className={`text-3xl font-black ${
                isCorrect ? "text-green-400" : "text-red-400"
              }`}>
                → {round.currentValue}
              </p>
              <p className={`text-sm font-bold mt-1 ${
                isCorrect ? "text-green-400" : "text-red-400"
              }`}>
                {isCorrect ? "✓ Correct!" : "✗ Wrong!"}
              </p>
            </div>
          )}
        </div>

        {/* Question */}
        {isPending && !hasGuessed && (
          <p className="text-center text-gray-500 text-sm px-6 pb-4">
            Will the next value be higher or lower?
          </p>
        )}

        {/* Buttons */}
        <div className="px-6 pb-6">
          {isPending && !hasGuessed && (
            <div className="flex gap-3">
              <button
                onClick={() => onGuess("higher")}
                className="flex-1 cursor-pointer bg-green-500 hover:bg-green-400 active:scale-95 text-black font-black py-5 rounded-2xl text-lg transition-all pulse-green"
              >
                ↑ Higher
              </button>
              <button
                onClick={() => onGuess("lower")}
                className="flex-1 cursor-pointer bg-red-500 hover:bg-red-400 active:scale-95 text-white font-black py-5 rounded-2xl text-lg transition-all"
              >
                ↓ Lower
              </button>
            </div>
          )}

          {isPending && hasGuessed && (
            <div className="text-center bg-yellow-400/10 border border-yellow-400/20 rounded-2xl py-4">
              <p className="text-yellow-400 text-sm animate-pulse">
                You guessed{" "}
                <span className="font-black uppercase">{round.guess}</span>
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Fetching live data...
              </p>
            </div>
          )}

          {!isPending && (
            <button
              onClick={onNext}
              className="w-full cursor-pointer bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-black font-black py-5 rounded-2xl text-lg transition-all"
            >
              Next Round →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}