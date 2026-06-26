"use client";

interface Props {
  streak: number;
  bestStreak: number;
  totalGuesses: number;
  correctGuesses: number;
}

export function ShareButton({ streak, bestStreak, totalGuesses, correctGuesses }: Props) {
  const accuracy = totalGuesses > 0
    ? Math.round((correctGuesses / totalGuesses) * 100)
    : 0;

  const handleShare = () => {
    const text = `🏆 MatchMind World Cup Challenge\n\n🔥 Streak: ${streak}\n⭐ Best: ${bestStreak}\n🎯 Accuracy: ${accuracy}%\n📊 Guesses: ${totalGuesses}\n\nPredict live World Cup stats on Solana!\nmatchmind.app`;

    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
      alert("Score copied to clipboard!");
    }
  };

  if (totalGuesses === 0) return null;

  return (
    <button
      onClick={handleShare}
      className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 active:scale-95 text-white font-bold py-3 rounded-2xl text-sm transition-all flex items-center justify-center gap-2"
    >
      🔗 Share your score
    </button>
  );
}