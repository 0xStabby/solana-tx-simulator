import {
  Connection,
  VersionedTransaction,
  PublicKey,
  RpcResponseAndContext,
  SimulatedTransactionResponse,
} from "@solana/web3.js";
import { RawAccount, getAssociatedTokenAddressSync } from "@solana/spl-token";

import { Buffer } from "buffer";

import getSplTokenMints from "./getSplTokenMints";
import getTokenBalance from "./getTokenBalance";
import getTokenBalanceFromAccount from "./getTokenBalanceFromAccount";
import decodeInstructionError from "./decodeInstructionError";

import {
  BalanceChange,
  BalanceChangeResult,
  createSuccess,
  createFailure,
} from "../types/balanceChange";

export async function simulateEncodedTransaction(connection: Connection, encodedTx: string, signerPublicKey: PublicKey):Promise<BalanceChangeResult> {
  const buffer = Buffer.from(encodedTx, "base64");
  const transaction = VersionedTransaction.deserialize(new Uint8Array(buffer));
  return simulateTransaction(connection, transaction, signerPublicKey);
}

export async function simulateTransaction(connection: Connection, transaction: VersionedTransaction, signerPublicKey: PublicKey):Promise<BalanceChangeResult> {
  try {
    const tokenMints = (await getSplTokenMints(connection, transaction)).map((mint) => mint.toBase58());
    const userTokenAccounts:string[] = [];
    tokenMints.forEach(t => {
      userTokenAccounts.push(getAssociatedTokenAddressSync(new PublicKey(t), signerPublicKey).toBase58());
    });
    //console.log("SPL Token Mints:", tokenMints);
    //console.log("spl tokenMints.length:", tokenMints.length);

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.message.recentBlockhash = blockhash;

    //console.log(chalk.blue("\n🔄 Simulating Transaction..."));
    const simulationResult: RpcResponseAndContext<SimulatedTransactionResponse> =
      await connection.simulateTransaction(transaction, {
        replaceRecentBlockhash: true,
        sigVerify: false,
        accounts: {
          encoding: "base64",
          addresses: [signerPublicKey.toBase58(), ...userTokenAccounts]
        }
      });

    if (simulationResult.value.err) {
      //console.log(chalk.red("❌ Simulation Failed:"), simulationResult.value.err);
      return createFailure(decodeInstructionError(simulationResult.value.err));
    }

    //console.log(chalk.green("\n✅ Transaction Simulated Successfully!"));

    //console.log("simulation results:", simulationResult);
    const accounts = simulationResult.value.accounts?.filter((account) => account !== null && account.data[0] !== "") || [];
    //console.log("accounts:", accounts);
    if (!accounts.length) {
      //console.log(chalk.red("❌ No token account balances found in simulation."));
      return createFailure("❌ No token account balances found in simulation.");
    }
    // TODO: should not fail if no token accounts, we still want to see if there is a sol balance change
    if (simulationResult.value.accounts == null) return createFailure();

    const preSolBalance = (await connection.getBalance(new PublicKey(signerPublicKey))) / 10 ** 9;
    const postSolBalance = (simulationResult.value.accounts[0]?.lamports || 0) / 10 ** 9;

    //console.log(chalk.yellow("\n💰 Token & SOL Balance Changes:"));

    const balanceChanges: Record<string, BalanceChange> = {};
    balanceChanges[simulationResult.value.accounts[0]?.owner || "SOL"] = {
      preBalance: preSolBalance,
      postBalance: postSolBalance,
      change: postSolBalance - preSolBalance
    }

    const postTokenAccounts = accounts.map(account => getTokenBalanceFromAccount(account))
      .filter((account): account is RawAccount => account !== null);


    for (const postTokenAccount of postTokenAccounts) {
      const userTokenAccount = getAssociatedTokenAddressSync(postTokenAccount.mint, signerPublicKey).toBase58()
      const preTokenBalance = await getTokenBalance(connection, new PublicKey(userTokenAccount));
      // TODO: get decimal from token in here
      const postTokenBalance = Number(postTokenAccount.amount) / 10 ** 6;
      if (!postTokenBalance) return createFailure();

      balanceChanges[postTokenAccount.mint.toBase58()] = {
        preBalance: preTokenBalance,
        postBalance: postTokenBalance,
        change: postTokenBalance - preTokenBalance
      }
    }

    return createSuccess(balanceChanges);
  } catch (error) {
    //console.error(chalk.red("❌ Failed to simulate transaction:"), error);
    const msg = error instanceof Error ? error.message : String(error);
    return createFailure(msg);
  }
}
