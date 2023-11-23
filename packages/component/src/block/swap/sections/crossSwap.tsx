import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { Divider } from "@/divider";
import { SwapSymbols, SymbolInfo } from "../sections/symbols";

import { SwapTime } from "../sections/swapTime";
import { SwapDetails } from "../sections/swapDetials";
import { useCrossSwap } from "@orderly.network/hooks";
import { toast } from "@/toast";
import { SwapMode, SwapProcessStatusStatus } from "../sections/misc";
import { API, WS_WalletStatusEnum } from "@orderly.network/types";
import { BridgeAndSwapProcessStatus } from "./bridgeAndSwapProcessStatus";

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

export const CrossSwap: FC<SwapProps> = (props) => {
  const {
    transactionData: transaction,
    slippage,
    mode,
    dst,
    src,
    chain: chainInfo,
    nativeToken,
  } = props;

  const [status, setStatus] = useState<SwapProcessStatusStatus>(
    SwapProcessStatusStatus.NONE
  );

  const [view, setView] = useState<"processing" | "details">("details");
  const [tx, setTx] = useState<any>();

  const {
    swap: doCrossSwap,
    bridgeStatus,
    message,
    status: swapStatus,
  } = useCrossSwap();

  const swapInfo = useMemo(() => {
    let info: any = {
      price: transaction.price,
      slippage,
      time: chainInfo?.est_txn_mins,
      received: dst.amount,
      bridgeFee: transaction.fees_from.stargate,
      swapFee: transaction.fees_from.woofi,
      dstGasFee: transaction.dst_infos.gas_fee,
    };

    return info;
  }, [transaction, chainInfo?.est_txn_mins, mode, dst]);

  useEffect(() => {
    if (bridgeStatus === "DELIVERED") {
      setStatus(SwapProcessStatusStatus.Depositing);
    }

    if (bridgeStatus === "FAILED") {
      setStatus(SwapProcessStatusStatus.BridgeFialed);
    }

    if (swapStatus === WS_WalletStatusEnum.COMPLETED) {
      setStatus(SwapProcessStatusStatus.Done);
    }

    if (swapStatus === WS_WalletStatusEnum.FAILED) {
      setStatus(SwapProcessStatusStatus.DepositFailed);
    }
  }, [bridgeStatus, swapStatus, status]);

  const doSwap = useCallback(() => {
    setView("processing");

    if (!transaction) return Promise.reject("No transaction data");
    setStatus(SwapProcessStatusStatus.Bridging);

    return doCrossSwap({
      address: "",
      crossChainRouteAddress: chainInfo!.woofi_dex_cross_chain_router!,
      src: {
        fromToken: transaction.src_infos.from_token,
        fromAmount: BigInt(transaction.src_infos.from_amount),
        bridgeToken: transaction.src_infos.bridge_token,
        minBridgeAmount: BigInt(transaction.src_infos.min_bridge_amount),
      },
      dst: {
        chainId: transaction.dst_infos.chain_id,
        bridgedToken: transaction.dst_infos.bridged_token,
        toToken: transaction.dst_infos.to_token,
        minToAmount: BigInt(transaction.dst_infos.min_to_amount),
        // @ts-ignore
        orderlyNativeFees: 0n,
      },
    }).then(
      (res: any) => {
        setTx(res);
        toast.success("Deposit requested");
      },
      (error: any) => {
        setStatus(SwapProcessStatusStatus.BridgeFialed);

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
      <BridgeAndSwapProcessStatus
        status={status}
        message={message}
        onComplete={props.onComplete}
      />
    );
  }, [view, swapInfo, message, status, mode, chainInfo, tx, props.onComplete]);

  return (
    <div>
      <div className="orderly-py-[24px]">
        <SwapSymbols from={props.src} to={props.dst} swapInfo={swapInfo} />
        <SwapTime time={chainInfo?.est_txn_mins ?? 0} />
      </div>
      <Divider />

      {content}
      <div className="orderly-flex orderly-justify-center orderly-text-3xs orderly-gap-2 orderly-mt-5">
        <span className="orderly-text-base-contrast/50">Need help?</span>
        <a href="" className="orderly-text-primary-light">
          View FAQs
        </a>
      </div>
    </div>
  );
};
