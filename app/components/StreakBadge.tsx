"use client";

import { useState, useEffect } from "react";

interface Badge {
  milestone: number;
  label: string;
  emoji: string;
  description: string;
  gradient: string;
  rarity: string;
  rarityColor: string;
}

const BADGES: Badge[] = [
  {
    milestone: 5,
    label: "Hot Streak",
    emoji: "🔥",
    description: "Predicted 5 stats in a row correctly",
    gradient: "from-orange-600 via-red-500 to-orange-600",
    rarity: "Common",
    rarityColor: "text-gray-300",
  },
  {
    milestone: 10,
    label: "World Class",
    emoji: "⭐",
    description: "Legendary prediction streak of 10",
    gradient: "from-yellow-500 via-amber-400 to-yellow-500",
    rarity: "Rare",
    rarityColor: "text-blue-400",
  },
  {
    milestone: 20,
    label: "Legendary",
    emoji: "👑",
    description: "Only the best reach a streak of 20",
    gradient: "from-purple-600 via-pink-500 to-purple-600",
    rarity: "Legendary",
    rarityColor: "text-purple-400",
  },
];

interface Props {
  streak: number;
  bestStreak: number;
}

export function StreakBadge({ streak, bestStreak }: Props) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationBadge, setCelebrationBadge] = useState<Badge | null>(null);

  const earnedBadges = BADGES.filter((b) => bestStreak >= b.milestone);
  const nextBadge = BADGES.find((b) => bestStreak < b.milestone);
  const justEarned = BADGES.find((b) => streak === b.milestone);

  useEffect(() => {
    if (justEarned) {
      setCelebrationBadge(justEarned);
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [streak]);

  return (
    <div className="flex flex-col gap-3 mt-3">

      {/* Celebration popup */}
      {showCelebration && celebrationBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 animate-fadeIn"
          onClick={() => setShowCelebration(false)}>
          <div className="flex flex-col items-center gap-4 p-8">
            <p className="text-white text-sm uppercase tracking-widest">Badge Unlocked!</p>
            <div className={`bg-linear-to-br ${celebrationBadge.gradient} rounded-3xl p-1`}>
              <div className="bg-gray-950 rounded-3xl p-6 flex flex-col items-center gap-3 w-56">
                <p className="text-6xl">{celebrationBadge.emoji}</p>
                <p className="text-white font-black text-xl text-center">{celebrationBadge.label}</p>
                <p className="text-gray-400 text-xs text-center">{celebrationBadge.description}</p>
                <span className={`text-xs font-bold ${celebrationBadge.rarityColor} border border-current px-2 py-1 rounded-full`}>
                  ◆ {celebrationBadge.rarity}
                </span>
                <div className="text-xs text-gray-600 text-center mt-1">
                  MatchMind · World Cup 2026
                </div>
              </div>
            </div>
            <p className="text-gray-500 text-xs">Tap to close</p>
          </div>
        </div>
      )}

      {/* Earned NFT cards */}
      {earnedBadges.length > 0 && (
        <div className="bg-gray-900 border border-white/5 rounded-2xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">
            🏅 Your NFT Badges ({earnedBadges.length})
          </p>
          <div className="flex gap-3 flex-wrap">
            {earnedBadges.map((badge) => (
              <div
                key={badge.milestone}
                className={`bg-linear-to-br ${badge.gradient} rounded-2xl p-0.5`}
              >
                <div className="bg-gray-950 rounded-2xl px-4 py-3 flex flex-col items-center gap-1 w-24">
                  <p className="text-3xl">{badge.emoji}</p>
                  <p className="text-white text-xs font-bold text-center leading-tight">{badge.label}</p>
                  <p className={`text-xs ${badge.rarityColor}`}>◆ {badge.rarity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next badge progress */}
      {nextBadge && (
        <div className="bg-gray-900 border border-white/5 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-3">
            <p className="text-xs text-gray-500 uppercase tracking-widest">Next Badge</p>
            <p className="text-xs text-gray-500">{bestStreak}/{nextBadge.milestone}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`bg-linear-to-br ${nextBadge.gradient} rounded-xl p-0.5`}>
              <div className="bg-gray-950 rounded-xl p-2">
                <p className="text-2xl">{nextBadge.emoji}</p>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-bold mb-1">{nextBadge.label}</p>
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-linear-to-r ${nextBadge.gradient} rounded-full transition-all duration-500`}
                  style={{ width: `${Math.min((bestStreak / nextBadge.milestone) * 100, 100)}%` }}
                />
              </div>
              <p className={`text-xs ${nextBadge.rarityColor} mt-1`}>◆ {nextBadge.rarity}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}