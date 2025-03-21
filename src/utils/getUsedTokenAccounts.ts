import { VersionedTransaction } from "@solana/web3.js";

export default async function getUsedTokenAccounts(transaction: VersionedTransaction): Promise<Set<string>> {
  const staticAccounts = transaction.message.staticAccountKeys;

  const usedTokenAccounts = new Set<string>();

  transaction.message.compiledInstructions.forEach((ix) => {
    ix.accountKeyIndexes.forEach((index) => {
      if (index < staticAccounts.length) {
        usedTokenAccounts.add(staticAccounts[index].toBase58());
      }
    });
  });

  return usedTokenAccounts;
}
