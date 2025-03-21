import { Connection, PublicKey, VersionedTransaction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import getUsedTokenAccounts from "./getUsedTokenAccounts";

export default async function getSplTokenMints(connection: Connection, transaction: VersionedTransaction): Promise<PublicKey[]> {
  const usedTokenAccounts = await getUsedTokenAccounts(transaction);

  const chunkSize = 100;
  let relevantTokenMints: Set<string> = new Set();

  const usedTokenAccountList = Array.from(usedTokenAccounts);

  // I don't think it will ever be over 100 addresses
  // Should check if tokens in lut can ever be effected in actual transaction
  for (let i = 0; i < usedTokenAccountList.length; i += chunkSize) {
    const chunk = usedTokenAccountList.slice(i, i + chunkSize);
    const accountInfos = await connection.getMultipleAccountsInfo(chunk.map((key) => new PublicKey(<any>key)));

    chunk.forEach((_, index) => {
      const accountInfo = accountInfos[index];

      if (accountInfo?.owner?.toBase58() === TOKEN_PROGRAM_ID.toBase58()) {
        const mintPubkey = new PublicKey(accountInfo.data.subarray(0, 32)).toBase58(); // First 32 bytes store the mint
        relevantTokenMints.add(mintPubkey);
      }
    });
  }

  return Array.from(relevantTokenMints).map((mint) => new PublicKey(mint));
}
