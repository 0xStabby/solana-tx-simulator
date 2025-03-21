import { Connection, PublicKey } from "@solana/web3.js";
import chalk from "chalk";
import { getJupiterQuote, getJupiterSwapTransaction } from "./swap";
import { simulateEncodedTransaction } from "../index";

import dotenv from 'dotenv';
dotenv.config();

function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing environment variable: ${key}`);
  return value;
}

const cluster = getEnvVar('CLUSTER');
const inputMint = getEnvVar('INPUT_MINT');
const outputMint = getEnvVar('OUTPUT_MINT');
const user = new PublicKey(getEnvVar('SIGNER_ADDRESS'));

async function executeSwap() {
  const connection = new Connection(
    cluster === "mainnet-beta"
      ? "https://api.mainnet-beta.solana.com"
      : "https://api.devnet.solana.com",
    "confirmed"
  );

  console.log(chalk.cyan("🔍 Fetching Swap Quote..."));
  const quote = await getJupiterQuote(inputMint, outputMint, 1_000_000);
  console.log("Jupiter Quote:", quote);

  const swapTx = await getJupiterSwapTransaction(user.toBase58(), quote);

  console.log(chalk.cyan("🗘 Simulating Swap Transaction..."));
  //console.log("transaction:", transaction);
  const result = await simulateEncodedTransaction(connection, swapTx.swapTransaction, user);
  console.log(chalk.yellow("💰 Token & SOL Balance Changes:"));
  console.log(result);
}

executeSwap().catch(console.error);
