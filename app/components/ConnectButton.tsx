"use client";

import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { useTxLineAuth } from "../lib/useTxLineAuth";
import { useAppStore } from "../lib/store";

export function ConnectButton() {
  const { setVisible } = useWalletModal();
  const { connected, publicKey, disconnect } = useWallet();
  const { authenticate, loading, error, step } = useTxLineAuth();
  const { jwt } = useAppStore();

  const shortAddress = publicKey
    ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
    : null;

  if (!connected) {
    return (
      <button
        onClick={() => setVisible(true)}
        className="bg-green-400 hover:bg-green-300 active:scale-95 text-black font-black px-6 py-2.5 rounded-full text-sm transition-all"
      >
        Connect Wallet
      </button>
    );
  }

  // if (connected && !jwt) {
  //   return (
  //     <div className="flex flex-col items-end gap-1">
  //       <div className="flex items-center gap-3">
  //         <span className="text-gray-400 text-xs font-mono">{shortAddress}</span>
  //         <button
  //           onClick={authenticate}
  //           disabled={loading}
  //           className="bg-yellow-400 hover:bg-yellow-300 active:scale-95 disabled:opacity-50 text-black font-black px-5 py-2.5 rounded-full text-sm transition-all"
  //         >
  //           {loading ? "..." : "Sign in"}
  //         </button>
  //       </div>
  //       {loading && step && (
  //         <p className="text-yellow-400 text-xs animate-pulse text-right max-w-48">
  //           {step}
  //         </p>
  //       )}
  //       {error && (
  //         <p className="text-red-400 text-xs text-right max-w-48">{error}</p>
  //       )}
  //     </div>
  //   );
  // }

  if (connected && !jwt) {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-xs font-mono">{shortAddress}</span>
          <button
            onClick={disconnect}
            className="text-gray-600 hover:text-red-400 text-xs transition-all"
          >
            Disconnect
          </button>
          <button
            onClick={authenticate}
            disabled={loading}
            className="bg-yellow-400 hover:bg-yellow-300 active:scale-95 disabled:opacity-50 text-black font-black px-5 py-2.5 rounded-full text-sm transition-all"
          >
            {loading ? "..." : "Sign in"}
          </button>
        </div>
        {loading && step && (
          <p className="text-yellow-400 text-xs animate-pulse text-right max-w-48">
            {step}
          </p>
        )}
        {error && (
          <p className="text-red-400 text-xs text-right max-w-48">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-400" />
        <span className="text-gray-400 text-xs font-mono">{shortAddress}</span>
      </div>
      <button
        onClick={disconnect}
        className="text-gray-600 cursor-pointer hover:text-red-400 text-xs transition-all"
      >
        Disconnect
      </button>
    </div>
  );
}