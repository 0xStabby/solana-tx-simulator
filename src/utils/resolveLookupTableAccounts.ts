import {
  Connection,
  VersionedTransaction,
  PublicKey,
  AddressLookupTableAccount,
} from "@solana/web3.js";

export default async function resolveLookupTableAccounts(
  connection: Connection,
  transaction: VersionedTransaction
): Promise<PublicKey[]> {
  const lookupTableAddresses = transaction.message.addressTableLookups.map(
    (lookup) => new PublicKey(lookup.accountKey)
  );

  if (lookupTableAddresses.length === 0) return [];

  const lookupTableAccounts = await connection.getMultipleAccountsInfo(lookupTableAddresses);
  //console.log("lookupTableAccounts:", lookupTableAccounts);

  return lookupTableAccounts
    .map((accountInfo) => {
      if (!accountInfo) return null;
      try {
        const lookupTableAccount = AddressLookupTableAccount.deserialize(accountInfo.data);
        return lookupTableAccount.addresses;
      } catch (err) {
        console.error("❌ Failed to deserialize lookup table:", err);
        return null;
      }
    })
    .flat()
    .filter((key): key is PublicKey => key !== null);
}
