# Solana TX Simulator

Simulate a Solana transaction and view detailed balance changes for any user — including SOL and SPL tokens. Useful for previews before submitting swaps or transfers.

> 🔍 Built for developers integrating with Jupiter and other Solana DEXes, wallets, or explorers.

---

## ✨ Features

- Simulates any base64-encoded or raw transaction
- Displays SOL and token balance changes

---

## 📦 Installation

```bash
npm install solana-tx-simulator
```

---

## 🚀 Usage

``` ts
import { Connection, PublicKey } from "@solana/web3.js";
import { simulateEncodedTransaction } from "solana-tx-simulator";

const connection = new Connection("https://api.mainnet-beta.solana.com");
const user = new PublicKey("your-wallet-public-key");
const encodedTx = "base64_transaction_string";

const result = await simulateEncodedTransaction(connection, encodedTx, user);
console.log(result);
```

---

## 📘 API

Simulates a base64-encoded transaction.
``` ts
simulateEncodedTransaction(connection, encodedTx, signerPublicKey)
```

Simulates a VersionedTransaction object directly.
``` ts
simulateTransaction(connection, transaction, signerPublicKey)
```

Both return a BalanceChangeResult:

``` ts
type BalanceChange = {
  preBalance: number,
  postBalance: number,
  change: number,
}

type SuccessResult = {
  success: true;
  balanceChanges: Record<string, BalanceChange>;
};

type FailureResult = {
  success: false;
  error?: string;
};

type BalanceChangeResult = SuccessResult | FailureResult;
```
