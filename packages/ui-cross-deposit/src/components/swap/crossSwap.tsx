import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { Box, toast } from "@orderly.network/ui";
import { WS_WalletStatusEnum } from "@orderly.network/types";
import { useCrossSwap } from "../../woo/useCrossSwap";
import { SwapProps } from "./swap";
import { SwapDetail } from "./swapDetail";
import { SwapMode, SwapProcessStatus } from "../../types";
import { ViewFAQs } from "./viewFAQs";
import { ProcessStatus } from "./processStatus";
import { useEventEmitter } from "@orderly.network/hooks";

export const CrossSwap: FC<SwapProps> = (props) => {
  const {
    transactionData: transaction,
    slippage,
    mode,
    dst,
    src,
    chain: chainInfo,
    nativeToken,
    depositFee,
  } = props;

  const [status, setStatus] = useState<SwapProcessStatus>(
    SwapProcessStatus.NONE
  );

  const [view, setView] = useState<"processing" | "details">("details");
  const [tx, setTx] = useState<any>();

  const ee = useEventEmitter();

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
      setStatus(SwapProcessStatus.Depositing);
    }

    if (bridgeStatus === "FAILED") {
      setStatus(SwapProcessStatus.BridgeFialed);
    }

    if (swapStatus === WS_WalletStatusEnum.COMPLETED) {
      setStatus(SwapProcessStatus.Done);
    }

    if (swapStatus === WS_WalletStatusEnum.FAILED) {
      setStatus(SwapProcessStatus.DepositFailed);
    }
  }, [bridgeStatus, swapStatus]);

  const doSwap = useCallback(() => {
    setView("processing");

    if (!transaction) return Promise.reject("No transaction data");
    setStatus(SwapProcessStatus.Bridging);

    return doCrossSwap({
      address: "",
      crossChainRouteAddress: (chainInfo as any)!.woofi_dex_cross_chain_router!,
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
        orderlyNativeFees: depositFee,
      },
    })
      .then((res: any) => {
        setTx(res);
        toast.success("Deposit requested");
        ee.emit("deposit:requested");
      })
      .catch((error: any) => {
        setStatus(SwapProcessStatus.BridgeFialed);
        toast.error(error?.message || "Error");
      });
  }, [transaction, mode, dst, src, ee]);

  const statusUrl = useMemo(() => {
    if (status < SwapProcessStatus.Depositing || !message) {
      return;
    }
    return `https://layerzeroscan.com/tx/${message.srcTxHash}`;
    // return `https://layerzeroscan.com/${message.srcChainId}/address/${message.srcUaAddress}/message/${message.dstChainId}/address/${message.dstUaAddress}/nonce/${message.srcUaNonce}`;
  }, [status, message]);

  return (
    <Box intensity={800}>
      <SwapDetail
        viewMode={view}
        onConfirm={doSwap}
        info={swapInfo}
        src={props.src}
        dst={props.dst}
        mode={mode}
        markPrice={transaction.mark_prices?.from_token ?? 1}
        nativePrice={transaction.mark_prices.native_token}
        nativeToken={nativeToken}
      />

      {view === "processing" && (
        <ProcessStatus
          mode={SwapMode.Cross}
          status={status}
          statusUrl={statusUrl}
          onComplete={props.onComplete}
          brokerName={props.brokerName}
        />
      )}
      <ViewFAQs />
    </Box>
  );
};
