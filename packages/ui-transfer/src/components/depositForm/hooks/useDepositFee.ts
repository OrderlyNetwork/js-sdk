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
    // deposit fee is native token; Solana lamports and Sui MIST both use 9 decimals.
    const decimals =
      account.walletAdapter?.chainNamespace === ChainNamespace.solana ||
      account.walletAdapter?.chainNamespace === ChainNamespace.sui
        ? 9
        : 18;

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
  }, [
    account.walletAdapter?.chainNamespace,
    depositFee,
    getIndexPrice,
    nativeSymbol,
    tokenInfo,
  ]);

  return feeProps;
}
