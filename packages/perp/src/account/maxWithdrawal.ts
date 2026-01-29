import { Decimal } from "@orderly.network/utils";

/**
 * max(0, min(USDC_balance, free_collateral - max(upnl, 0)))
 */
export const maxWithdrawalUSDC = (inputs: {
  USDCBalance: number;
  freeCollateral: Decimal;
  upnl: number;
}) => {
  const { USDCBalance, freeCollateral, upnl } = inputs;
  const value = Math.min(
    new Decimal(USDCBalance).toNumber(),
    new Decimal(freeCollateral).sub(Math.max(upnl, 0)).toNumber(),
  );
  return Math.max(0, value);
};
