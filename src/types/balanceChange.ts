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

function createSuccess(balanceChanges: Record<string, BalanceChange>): SuccessResult {
  return {
    success: true,
    balanceChanges
  };
}

function createFailure(error?: string): FailureResult {
  return {
    success: false,
    error
  };
}

export { BalanceChange, SuccessResult, FailureResult, BalanceChangeResult, createSuccess, createFailure };
