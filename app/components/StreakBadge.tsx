"use client";

interface Badge {
  milestone: number;
  label: string;
  emoji: string;
  color: string;
}

const BADGES: Badge[] = [
  { milestone: 5, label: "Hot Streak", emoji: "🔥", color: "from-orange-500 to-red-500" },
  { milestone: 10, label: "World Class", emoji: "⭐", color: "from-yellow-400 to-orange-500" },
  { milestone: 20, label: "Legendary", emoji: "👑", color: "from-purple-500 to-pink-500" },
];

interface Props {
  streak: number;
  bestStreak: number;
}

export function StreakBadge({ streak, bestStreak }: Props) {
  const earnedBadges = BADGES.filter((b) => bestStreak >= b.milestone);
  const nextBadge = BADGES.find((b) => bestStreak < b.milestone);
  const justEarned = BADGES.find((b) => streak === b.milestone);

  if (earnedBadges.length === 0 && !nextBadge) return null;

  return (
    <div className="flex flex-col gap-3">
      {/* Just earned notification */}
      {justEarned && (
        <div className={`bg-linear-to-r ${justEarned.color} rounded-2xl p-4 text-center animate-fadeIn`}>
          <p className="text-2xl mb-1">{justEarned.emoji}</p>
          <p className="font-black text-white text-lg">{justEarned.label} Unlocked!</p>
          <p className="text-white/70 text-xs mt-1">
            {justEarned.milestone} streak · Minting your badge on Solana...
          </p>
        </div>
      )}

      {/* Earned badges */}
      {earnedBadges.length > 0 && (
        <div className="bg-gray-900 border border-white/5 rounded-2xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Your Badges</p>
          <div className="flex gap-2 flex-wrap">
            {earnedBadges.map((badge) => (
              <div
                key={badge.milestone}
                className={`bg-linear-to-r ${badge.color} rounded-xl px-3 py-2 flex items-center gap-2`}
              >
                <span>{badge.emoji}</span>
                <span className="text-white text-xs font-bold">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next badge progress */}
      {nextBadge && (
        <div className="bg-gray-900 border border-white/5 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs text-gray-500">Next Badge</p>
            <p className="text-xs text-gray-400">
              {bestStreak}/{nextBadge.milestone} streak
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xl">{nextBadge.emoji}</span>
            <div className="flex-1">
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-linear-to-r ${nextBadge.color} rounded-full transition-all`}
                  style={{ width: `${Math.min((bestStreak / nextBadge.milestone) * 100, 100)}%` }}
                />
              </div>
              <p className="text-white text-xs font-bold mt-1">{nextBadge.label}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}