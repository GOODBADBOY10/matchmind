"use client";

import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useCallback, useState } from "react";
import * as anchor from "@coral-xyz/anchor";
import {
    PublicKey,
    SystemProgram,
} from "@solana/web3.js";
import {
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import axios from "axios";
import { getGuestJwt, activateApiToken } from "./txline";
import { useAppStore } from "./store";

const PROGRAM_ID = new PublicKey("9ExbZjAapQww1vfcisDmrngPinHTEfpjYRWMunJgcKaA");
const TXL_MINT = new PublicKey("Zhw9TVKp68a1QrftncMSd6ELXKDtpVMNuMGr1jNwdeL");
const BASE_URL = process.env.NEXT_PUBLIC_TXLINE_BASE_URL!;
const SERVICE_LEVEL_ID = 12;
const DURATION_WEEKS = 4;

const IDL = {
    address: "9ExbZjAapQww1vfcisDmrngPinHTEfpjYRWMunJgcKaA",
    metadata: { name: "txoracle", version: "1.5.2", spec: "0.1.0" },
    instructions: [
        {
            name: "subscribe",
            discriminator: [254, 28, 191, 138, 156, 179, 183, 53],
            accounts: [
                { name: "user", writable: true, signer: true },
                { name: "pricingMatrix" },
                { name: "tokenMint" },
                { name: "userTokenAccount", writable: true },
                { name: "tokenTreasuryVault", writable: true },
                { name: "tokenTreasuryPda" },
                { name: "tokenProgram" },
                { name: "systemProgram" },
                { name: "associatedTokenProgram" },
            ],
            args: [
                { name: "serviceLevelId", type: "u16" },
                { name: "weeks", type: "u8" },
            ],
        },
    ],
    accounts: [],
    errors: [],
    types: [],
};

export function useTxLineAuth() {
    const { publicKey, signMessage, sendTransaction } = useWallet();
    const { connection } = useConnection();
    const { setAuth } = useAppStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState("");

    const authenticate = useCallback(async () => {
        if (!publicKey || !sendTransaction) {
            setError("Please connect your wallet first.");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Step 1: Get guest JWT
            setStep("Getting auth token...");
            //   const authResponse = await axios.post(`${BASE_URL}/auth/guest/start`);
            //   const jwt = authResponse.data.token;

            const jwt = await getGuestJwt();

            // Step 2: Derive PDAs
            setStep("Preparing on-chain subscription...");
            const [tokenTreasuryPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("token_treasury_v2")],
                PROGRAM_ID
            );
            const [pricingMatrixPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("pricing_matrix")],
                PROGRAM_ID
            );
            const tokenTreasuryVault = getAssociatedTokenAddressSync(
                TXL_MINT,
                tokenTreasuryPda,
                true,
                TOKEN_2022_PROGRAM_ID
            );
            // const userTokenAccount = getAssociatedTokenAddressSync(
            //     TXL_MINT,
            //     publicKey,
            //     false,
            //     TOKEN_2022_PROGRAM_ID
            // );

            const userTokenAccount = getAssociatedTokenAddressSync(
                TXL_MINT,
                publicKey,
                false,
                TOKEN_2022_PROGRAM_ID
            );

            // Create token account if it doesn't exist
            const accountInfo = await connection.getAccountInfo(userTokenAccount);
            if (!accountInfo) {
                const { createAssociatedTokenAccountInstruction } = await import("@solana/spl-token");
                const createAtaIx = createAssociatedTokenAccountInstruction(
                    publicKey,
                    userTokenAccount,
                    publicKey,
                    TXL_MINT,
                    TOKEN_2022_PROGRAM_ID,
                    ASSOCIATED_TOKEN_PROGRAM_ID
                );
                const createAtaTx = new anchor.web3.Transaction().add(createAtaIx);
                setStep("Creating token account...");
                const createAtaSig = await sendTransaction(createAtaTx, connection);
                await connection.confirmTransaction(createAtaSig, "confirmed");
            }

            // Step 3: Build and send subscribe transaction
            setStep("Please approve the transaction in your wallet...");
            const wallet = {
                publicKey,
                signTransaction: async (tx: anchor.web3.Transaction) => tx,
                signAllTransactions: async (txs: anchor.web3.Transaction[]) => txs,
            };
            const provider = new anchor.AnchorProvider(connection, wallet as anchor.Wallet, {
                commitment: "confirmed",
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const program = new anchor.Program(IDL as any, provider);

            const tx = await program.methods
                .subscribe(SERVICE_LEVEL_ID, DURATION_WEEKS)
                .accounts({
                    user: publicKey,
                    pricingMatrix: pricingMatrixPda,
                    tokenMint: TXL_MINT,
                    userTokenAccount,
                    tokenTreasuryVault,
                    tokenTreasuryPda,
                    tokenProgram: TOKEN_2022_PROGRAM_ID,
                    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                })
                .transaction();

            // const txSig = await sendTransaction(tx, connection, {
            //     skipPreflight: false,
            // });

            // setStep("Confirming transaction...");
            // await connection.confirmTransaction(txSig, "confirmed");

            let txSig: string;
            try {
                txSig = await sendTransaction(tx, connection, {
                    skipPreflight: true,
                });
                setStep("Confirming transaction...");
                const confirmation = await connection.confirmTransaction(txSig, "confirmed");
                if (confirmation.value.err) {
                    throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
                }
            } catch (txError: unknown) {
                const msg = txError instanceof Error ? txError.message : String(txError);
                throw new Error(`On-chain subscription failed: ${msg}`);
            }

            // Step 4: Sign activation message
            setStep("Signing in...");
            const messageString = `${txSig}::${jwt}`;
            const message = new TextEncoder().encode(messageString);
            const signatureBytes = await signMessage!(message);
            const walletSignature = Buffer.from(signatureBytes).toString("base64");

            // Step 5: Activate API token
            setStep("Activating API access...");
            // const activationResponse = await axios.post(
            //     `${BASE_URL}/api/token/activate`,
            //     { txSig, walletSignature, leagues: [] },
            //     { headers: { Authorization: `Bearer ${jwt}` } }
            // );
            // const apiToken = activationResponse.data.token || activationResponse.data;

            const apiToken = await activateApiToken(txSig, walletSignature, jwt);

            setAuth(jwt, apiToken);
            setStep("Done!");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Authentication failed.");
        } finally {
            setLoading(false);
        }
    }, [publicKey, signMessage, sendTransaction, connection, setAuth]);

    return { authenticate, loading, error, step };
}