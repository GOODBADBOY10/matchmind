# MatchMind 🧠⚽

> Predict live World Cup stats. Build your streak. Earn badges on Solana.

MatchMind is a real-time Hi-Lo prediction game built on Solana for the World Cup 2026. Players connect their Solana wallet, pick a live match, and predict whether the next stat update (goals, corners, yellow cards) will be higher or lower than the current value — all powered by TxLINE's live data feed.

## 🎮 How It Works

1. Connect your Solana wallet (Phantom, Solflare, etc.)
2. Subscribe to TxLINE on-chain (free — Service Level 12)
3. Pick a live World Cup match
4. Predict if the next stat will be **Higher** or **Lower**
5. TxLINE's live data resolves your prediction in real time
6. Build your streak and earn NFT badges

## 🏆 NFT Badge System

| Badge | Streak Required | Rarity |
|-------|----------------|--------|
| 🔥 Hot Streak | 5 | Common |
| ⭐ World Class | 10 | Rare |
| 👑 Legendary | 20 | Legendary |

Badges are earned automatically when streak milestones are hit.

## 💰 Monetization

**Free Tier**
- All 104 World Cup matches
- Goals, corners, yellow cards stats
- Basic badge milestones

**Pro Tier (coming soon — $4.99/month)**
- Advanced stats (shots, possession, xG, offsides)
- Rare badge milestones (30, 50, 100 streak)
- Tournament mode with prize pools
- Historical match replay

## 🔧 Tech Stack

- **Frontend** — Next.js 16, TypeScript, Tailwind CSS
- **Blockchain** — Solana, Anchor, @solana/wallet-adapter
- **Data** — TxLINE API (TxODDS) — real-time World Cup scores
- **State** — Zustand
- **Deployment** — Vercel

## 📡 TxLINE Endpoints Used

| Endpoint | Purpose |
|----------|---------|
| `POST /auth/guest/start` | Get guest JWT |
| `POST /api/token/activate` | Activate API token after on-chain subscription |
| `GET /api/fixtures/snapshot` | Fetch all World Cup fixtures |
| `GET /api/scores/snapshot/{fixtureId}` | Fetch live scores for a match |

## 🔗 On-Chain Integration

MatchMind uses TxLINE's Solana program for subscription management:

- **Program ID:** `9ExbZjAapQww1vfcisDmrngPinHTEfpjYRWMunJgcKaA`
- **Service Level:** 12 (Real-time World Cup data)
- **Duration:** 4 weeks
- Users subscribe on-chain via the `subscribe` instruction
- API token is activated by signing the transaction signature with the user's wallet

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Solana wallet (Phantom recommended)
- Tiny amount of SOL for transaction fees (~0.001 SOL)

### Installation

```bash
git clone https://github.com/GOODBADBOY10/matchmind.git
cd matchmind
npm install --legacy-peer-deps
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_TXLINE_BASE_URL=https://txline.txodds.com
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📹 Demo

[Watch the demo video](#) — coming soon

## 🛠️ TxLINE API Feedback

**What worked great:**
- Normalised JSON schema made it easy to work across all fixtures
- Free tier for World Cup was perfect for hackathon development
- Score snapshot endpoint returned rich event data

**Friction points:**
- CORS blocks direct browser calls — required a Next.js proxy layer
- `GameState` field returns `"scheduled"` for all matches including live and finished ones — had to infer match status from `StartTime`
- Score data uses capitalized field names (`Score`, `Participant1`) inconsistent with some docs showing camelCase

## 📄 License

MIT