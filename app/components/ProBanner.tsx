"use client";

import { useState } from "react";

interface Props {
  totalGuesses: number;
}

export function ProBanner({ totalGuesses }: Props) {
  const [dismissed, setDismissed] = useState(false);

  // Show after 3 guesses
  if (totalGuesses < 3 || dismissed) return null;

  return (
    <div className="bg-linear-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-2xl p-4 flex items-center justify-between gap-3 animate-fadeIn">
      <div>
        <p className="text-white font-black text-sm">⚡ Unlock Pro</p>
        <p className="text-gray-400 text-xs mt-0.5">
          Advanced stats · Rare badges · Tournament mode
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => setDismissed(true)}
          className="text-gray-600 hover:text-gray-400 text-xs transition-all"
        >
          Later
        </button>
        <button
          className="bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-black px-4 py-2 rounded-xl text-xs transition-all active:scale-95"
          onClick={() => alert("Pro tier coming soon! Join the waitlist at matchmind.app")}
        >
          Upgrade →
        </button>
      </div>
    </div>
  );
}