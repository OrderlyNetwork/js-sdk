import { useMemo } from "react";
import { useAccount, useTokenInfo } from "@orderly.network/hooks";
import { ChainNamespace } from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";

export type UseDepositFeeReturn = ReturnType<typeof useDepositFee>;

export function useDepositFee(options: {
  nativeSymbol?: string;
  depositFee?: bigint;
  getIndexPrice: (token: string) => number;
}) {
  const { nativeSymbol, depositFee = 0, getIndexPrice } = options;
  const { account } = useAccount();

  const tokenInfo = useTokenInfo(nativeSymbol!);

  const feeProps = useMemo(() => {
    // deposit fee is native token, so evm decimals is 18, solana is 9
    const decimals =
      account.walletAdapter?.chainNamespace === ChainNamespace.solana ? 9 : 18;

    const dstGasFee = new Decimal(depositFee.toString())
      .div(new Decimal(10).pow(decimals))
      .toString();

    const indexPrice = getIndexPrice(nativeSymbol!);

    const feeAmount = new Decimal(dstGasFee).mul(indexPrice || 0).toString();

    return {
      dstGasFee,
      feeQty: dstGasFee,
      feeAmount,
      dp: tokenInfo?.decimals || 8,
    };
  }, [depositFee, tokenInfo]);

  return feeProps;
}
