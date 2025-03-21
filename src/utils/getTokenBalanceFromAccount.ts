import { AccountLayout, RawAccount } from "@solana/spl-token";

/**
 * Extracts the token balance from a simulated transaction account info
 * @param accountInfo - Account info object from simulation.value.accounts
 * @returns RawAccount
 */
export default function getTokenBalanceFromAccount(accountInfo: any): RawAccount | null {
  if (!accountInfo || !accountInfo.data || accountInfo.data.length < 2) {
    return null;
  }

  const decodedData = Buffer.from(accountInfo.data[0], "base64");
  const parsedAccount = AccountLayout.decode(decodedData);

  return parsedAccount;
}
