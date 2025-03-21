import { createJupiterApiClient } from "@jup-ag/api";

const jupiterApi = createJupiterApiClient();

export async function getJupiterQuote(inputMint: string, outputMint: string, amount: number) {
  return await jupiterApi.quoteGet({
    inputMint,
    outputMint,
    amount,
    slippageBps: 50,
  });
}

export async function getJupiterSwapTransaction(userPublicKey: string, quoteResponse: any) {
  return await jupiterApi.swapPost({
    swapRequest: {
      userPublicKey,
      quoteResponse,
    }
  });
}
