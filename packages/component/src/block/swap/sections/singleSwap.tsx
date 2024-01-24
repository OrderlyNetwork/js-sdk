import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { Divider } from "@/divider";
import { SwapSymbols } from "../sections/symbols";
import { SwapTime } from "../sections/swapTime";
import { SwapDetails } from "../sections/swapDetials";
import { useSwap } from "@orderly.network/hooks";
import { toast } from "@/toast";
import { SwapProcessStatusStatus } from "../sections/misc";
import { WS_WalletStatusEnum } from "@orderly.network/types";
import { SwapProcessStatus } from "./swapProcessStatus";
import { Decimal } from "@orderly.network/utils";
import { SwapProps } from "../swap";

export const SingleSwap: FC<SwapProps> = (props) => {
  const {
    transactionData: transaction,
    slippage,
    mode,
    dst,
    src,
    chain,
    nativeToken,
    depositFee,
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
      dstGasFee: new Decimal(depositFee!.toString())
        ?.div(new Decimal(10).pow(18))
        ?.toString(),
      swapFee: transaction.fees_from,
    };

    return info;
  }, [transaction, chain?.est_txn_mins, mode, dst, depositFee]);

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
        orderlyNativeFees: depositFee,
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
        brokerName={props.brokerName}
      />
    );
  }, [view, swapInfo, mode, chain, tx, props.onComplete, status]);

  return (
    <div>
      <div className="orderly-py-[24px]">
        <SwapSymbols from={props.src} to={props.dst} swapInfo={swapInfo} />
        <SwapTime time={chain?.est_txn_mins ?? 0} />
      </div>
      <Divider />

      {content}
      <div className="orderly-flex orderly-justify-center orderly-text-3xs orderly-gap-2 orderly-mt-5">
        <span className="orderly-text-base-contrast-54">Need help?</span>
        <a
          href="https://learn.woo.org/woofi/faqs/woofi-pro"
          className="orderly-text-primary-light"
        >
          View FAQs
        </a>
      </div>
    </div>
  );
};
