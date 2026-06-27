"use client";

import { useState } from "react";

interface Props {
  totalGuesses: number;
}

export function ProBanner({ totalGuesses }: Props) {
  const [dismissed, setDismissed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [joined, setJoined] = useState(false);

  if (totalGuesses < 3 || dismissed) return null;

  return (
    <>
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-fadeIn p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-gray-900 border border-purple-500/30 rounded-3xl p-6 max-w-sm w-full flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <p className="text-3xl mb-2">⚡</p>
              <h3 className="text-white font-black text-xl">MatchMind Pro</h3>
              <p className="text-gray-400 text-sm mt-1">
                Take your predictions to the next level
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {[
                { icon: "📊", text: "Advanced stats — shots, possession, xG" },
                { icon: "🏆", text: "Tournament mode with prize pools" },
                { icon: "👑", text: "Rare badge milestones (30, 50, 100 streak)" },
                { icon: "🔄", text: "Historical match replay" },
                { icon: "⚡", text: "Real-time stat updates every 10 seconds" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-gray-800 rounded-xl p-3">
                  <span>{item.icon}</span>
                  <p className="text-gray-300 text-sm">{item.text}</p>
                </div>
              ))}
            </div>

            {!joined ? (
              <>
                <div className="bg-linear-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-2xl p-4 text-center">
                  <p className="text-white font-black text-2xl">
                    $4.99<span className="text-gray-400 font-normal text-sm">/month</span>
                  </p>
                  <p className="text-gray-500 text-xs mt-1">Cancel anytime</p>
                </div>
                <button
                  className="w-full bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-black py-4 rounded-2xl transition-all active:scale-95"
                  onClick={() => setJoined(true)}
                >
                  Join Waitlist →
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-600 hover:text-gray-400 text-sm text-center transition-all"
                >
                  Maybe later
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 py-4 animate-fadeIn">
                <p className="text-4xl">🚀</p>
                <p className="text-white font-black text-lg text-center">
                  You're on the list!
                </p>
                <p className="text-gray-400 text-sm text-center">
                  We'll notify you when Pro launches. Keep building your streak!
                </p>
                <button
                  onClick={() => { setShowModal(false); setDismissed(true); }}
                  className="w-full bg-green-500 hover:bg-green-400 text-black font-black py-4 rounded-2xl transition-all active:scale-95 mt-2"
                >
                  Back to Game →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

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
            onClick={() => setShowModal(true)}
          >
            Upgrade →
          </button>
        </div>
      </div>
    </>
  );
}