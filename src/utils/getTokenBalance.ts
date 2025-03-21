import { Connection, PublicKey } from "@solana/web3.js";
import { getMint } from "@solana/spl-token";
import { AccountLayout } from "@solana/spl-token";

/**
 * Fetches the balance of an SPL token account.
 * @param connection The Solana connection instance.
 * @param tokenAccount The public key of the SPL token account.
 * @returns Promise<number> The SPL token balance.
 */
export default async function getTokenBalance(connection: Connection, tokenAccount: PublicKey): Promise<number> {
  const accountInfo = await connection.getAccountInfo(tokenAccount);
  
  if (!accountInfo || accountInfo.data.length === 0) {
    return 0;
    //throw new Error("Token account not found");
  }

  const tokenData = AccountLayout.decode(accountInfo.data);
  const mint = await getMint(connection, tokenData.mint);
  return Number(tokenData.amount) / 10 ** mint.decimals; // Adjust decimals based on the token
}
