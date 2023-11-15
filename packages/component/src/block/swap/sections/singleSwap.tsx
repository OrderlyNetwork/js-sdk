import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { Divider } from "@/divider";
import { SwapSymbols, SymbolInfo } from "../sections/symbols";

import { SwapTime } from "../sections/swapTime";
import { SwapDetails, SwapInfo } from "../sections/swapDetials";
import { SwapProcess } from "../sections/swapProcess";
import { useCrossSwap, useSwap } from "@orderly.network/hooks";
import { toast } from "@/toast";
import { SwapMode, SwapProcessStatusStatus } from "../sections/misc";
import { API, WS_WalletStatusEnum } from "@orderly.network/types";
import { SwapProcessStatus } from "./swapProcessStatus";

export interface SwapProps {
  src: SymbolInfo;
  dst: SymbolInfo;
  // swapInfo: SwapInfo;
  mode: SwapMode;
  transactionData: any;
  slippage: number;

  chain?: API.NetworkInfos;
  nativeToken?: API.TokenInfo;

  onComplete?: (isSuccss: boolean) => void;
  onCancel?: () => void;
  onFail?: () => void;
}

export const SingleSwap: FC<SwapProps> = (props) => {
  const {
    transactionData: transaction,
    slippage,
    mode,
    dst,
    src,
    chain,
    nativeToken,
  } = props;

  const [status, setStatus] = useState<SwapProcessStatusStatus>(
    SwapProcessStatusStatus.NONE
  );

  const [view, setView] = useState<"processing" | "details">("details");
  const [tx, setTx] = useState<any>();

  const { swap: doSingleSwap, status: swapStatus } = useSwap();

  const swapInfo = useMemo(() => {
    let info: any = {
      price: transaction.price,
      slippage,
      time: chain?.est_txn_mins,
      received: dst.amount,
      dstGasFee: "0",
      swapFee: transaction.fees_from,
    };

    return info;
  }, [transaction, chain?.est_txn_mins, mode, dst]);

  useEffect(() => {
    if (swapStatus === WS_WalletStatusEnum.COMPLETED) {
      setStatus(SwapProcessStatusStatus.Done);
    }

    if (swapStatus === WS_WalletStatusEnum.FAILED) {
      setStatus(SwapProcessStatusStatus.DepositFailed);
    }
  }, [swapStatus]);

  const doSwap = useCallback(() => {
    setView("processing");

    if (!transaction) return Promise.reject("No transaction data");
    if (!chain || !chain.woofi_dex_depositor)
      return Promise.reject("No chain data");

    setStatus(SwapProcessStatusStatus.Depositing);

    return doSingleSwap(
      chain.woofi_dex_depositor,
      {
        fromToken: transaction.infos.from_token,
        fromAmount: transaction.infos.from_amount,
        toToken: transaction.infos.to_token,
        minToAmount: transaction.infos.min_to_amount,
        orderlyNativeFees: 0n,
      },
      { dst, src }
    ).then(
      (res: any) => {
        //
        setTx(res);
        toast.success("Deposit requested");
      },
      (error: any) => {
        setStatus(SwapProcessStatusStatus.DepositFailed);

        toast.error(error.message || "Error");
      }
    );
  }, [transaction, mode, dst, src]);

  const content = useMemo(() => {
    if (view === "details") {
      return (
        <SwapDetails
          onConfirm={doSwap}
          info={swapInfo}
          src={props.src}
          dst={props.dst}
          mode={mode}
          markPrice={transaction.mark_prices?.from_token ?? 1}
          nativePrice={transaction.mark_prices.native_token}
          nativeToken={nativeToken}
        />
      );
    }

    return (
      <SwapProcessStatus
        status={status}
        tx={tx}
        chainInfo={props.chain}
        onComplete={props.onComplete}
      />
    );
  }, [view, swapInfo, mode, chain, tx, props.onComplete, status]);

  return (
    <div>
      <div className="py-[24px]">
        <SwapSymbols from={props.src} to={props.dst} swapInfo={swapInfo} />
        <SwapTime time={chain?.est_txn_mins ?? 0} />
      </div>
      <Divider />

      {content}
      <div className="flex justify-center text-3xs gap-2 mt-5">
        <span className="text-base-contrast-54">Need help?</span>
        <a href="" className="text-primary-light">
          View FAQs
        </a>
      </div>
    </div>
  );
};
