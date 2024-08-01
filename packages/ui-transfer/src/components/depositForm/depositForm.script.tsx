import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useChains,
  useConfig,
  useDeposit,
  useIndexPrice,
  useWalletConnector,
} from "@orderly.network/hooks";
import { API, NetworkId } from "@orderly.network/types";
import { Decimal, int2hex, praseChainIdToNumber } from "@orderly.network/utils";
import { toast } from "@orderly.network/ui";
import { ActionType } from "../actionButton";
import { useAppContext } from "@orderly.network/react-app";
import { feeDecimalsOffset, getTokenByTokenList } from "../../utils";

export type InputStatus = "error" | "warning" | "success" | "default";

export type UseDepositFormScriptReturn = ReturnType<
  typeof useDepositFormScript
>;

export type UseDepositFormScriptOptions = {
  onClose?: () => void;
};

export const useDepositFormScript = (options: UseDepositFormScriptOptions) => {
  const [inputStatus, setInputStatus] = useState<InputStatus>("default");
  const [hintMessage, setHintMessage] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  const [token, setToken] = useState<API.TokenInfo>();
  const [tokens, setTokens] = useState<API.TokenInfo[]>([]);

  const config = useConfig();
  const brokerName = config.get("brokerName") || "";
  const brokerId = config.get("brokerId");
  const networkId = config.get("networkId") as NetworkId;

  const [chains, { findByChainId }] = useChains(networkId, {
    pick: "network_infos",
    filter: (chain: any) =>
      chain.network_infos?.bridge_enable || chain.network_infos?.bridgeless,
  });

  const { wrongNetwork } = useAppContext();

  const {
    connectedChain,
    wallet,
    setChain: switchChain,
    settingChain,
  } = useWalletConnector();

  const currentChain = useMemo(() => {
    if (!connectedChain) return null;

    const chainId = praseChainIdToNumber(connectedChain.id);
    const chain = findByChainId(chainId);

    return {
      ...connectedChain,
      id: chainId,
      info: chain!,
    };
  }, [connectedChain, findByChainId]);

  const { walletName, address } = useMemo(
    () => ({
      walletName: wallet?.label,
      address: wallet?.accounts?.[0].address,
    }),
    [wallet]
  );

  const {
    dst,
    balance: maxQuantity,
    allowance,
    depositFeeRevalidating,
    depositFee,
    quantity,
    setQuantity,
    approve,
    deposit,
    isNativeToken,
    balanceRevalidating,
    fetchBalance,
  } = useDeposit({
    address: token?.address,
    decimals: token?.decimals,
    srcChainId: currentChain?.id,
    srcToken: token?.symbol,
  });

  const cleanData = () => {
    setQuantity("");
  };

  const onDirectDeposit = useCallback(() => {
    deposit()
      .then((res: any) => {
        setQuantity("");
        toast.success("Deposit requested");
        options.onClose?.();
      })
      .catch((error) => {
        toast.error(error?.errorCode || "Deposit failed");
      })
      .finally(() => {
        setSubmitting(false);
      });
  }, [deposit]);

  const onDeposit = useCallback(() => {
    const num = Number(quantity);

    if (!token) {
      toast.error("Please select a token");
      return;
    }

    if (isNaN(num) || num <= 0) {
      toast.error("Please input a valid number");
      return;
    }

    if (inputStatus !== "default") {
      return;
    }

    if (submitting) return;

    setSubmitting(true);
    onDirectDeposit();
  }, [quantity, submitting, token, onDirectDeposit]);

  const onApprove = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);

    return approve()
      .then((res: any) => {
        toast.success("Approve success");
      })
      .catch((error) => {
        console.log("approve error", error);
        toast.error(error?.errorCode || "Approve failed");
      })
      .finally(() => {
        setSubmitting(false);
      });
    // whether approve is depends on quantity and allowance
  }, [quantity, submitting, allowance, approve]);

  const onTokenChange = (token: API.TokenInfo) => {
    cleanData();
    setToken(token);
  };

  const onChainChange = useCallback(
    async (chain: API.NetworkInfos) => {
      const chainInfo = findByChainId(chain.chain_id);

      if (
        !chainInfo ||
        chainInfo.network_infos?.chain_id === currentChain?.id
      ) {
        return Promise.resolve();
      }

      return switchChain?.({
        chainId: int2hex(Number(chainInfo.network_infos?.chain_id)),
      })
        .then((switched) => {
          if (switched) {
            toast.success("Network switched");
            // clean input value
            cleanData();
          } else {
            toast.error("Switch chain failed");
          }
        })
        .catch((error) => {
          toast.error(`Switch chain failed: ${error.message}`);
        });
    },
    [currentChain, switchChain, findByChainId]
  );

  // when chain changed and chain data ready then call this function
  const onChainInited = useCallback((chainInfo?: API.Chain) => {
    if (chainInfo && chainInfo?.token_infos?.length > 0) {
      const tokens = chainInfo.token_infos;
      setTokens(tokens);

      const newToken = getTokenByTokenList(tokens);

      if (!newToken) return;

      setToken(newToken);
    }
  }, []);

  useEffect(() => {
    onChainInited(currentChain?.info);
    // if settingChain is true, the currentChain will change, so use currentChain.id
  }, [currentChain?.id]);

  useEffect(() => {
    if (!quantity) {
      // reset input status when value is empty
      setInputStatus("default");
      setHintMessage("");
      return;
    }

    const d = new Decimal(quantity);

    if (d.gt(maxQuantity)) {
      setInputStatus("error");
      setHintMessage("Insufficient balance");
    } else {
      // reset input status
      setInputStatus("default");
      setHintMessage("");
    }
  }, [quantity, maxQuantity]);

  const disabled =
    !quantity ||
    Number(quantity) === 0 ||
    inputStatus === "error" ||
    depositFeeRevalidating!;

  const loading = submitting || depositFeeRevalidating!;

  const markPrice = 1;

  const amount = useMemo(() => {
    return new Decimal(quantity || 0).mul(markPrice).toNumber();
  }, [quantity, markPrice]);

  const actionType = useMemo(() => {
    const allowanceNum = isNativeToken ? Number.MAX_VALUE : Number(allowance);

    if (allowanceNum <= 0) {
      return ActionType.Approve;
    }

    const qty = Number(quantity);
    const maxQty = Number(maxQuantity);

    if (allowanceNum < qty && qty <= maxQty) {
      return ActionType.Increase;
    }

    return ActionType.Deposit;
  }, [isNativeToken, allowance]);

  const nativeToken = currentChain?.info?.nativeToken;
  const fee = useDepositFee({ nativeToken, depositFee });

  return {
    walletName,
    address,
    token,
    tokens,
    brokerId,
    brokerName,
    networkId,
    chains,
    currentChain,
    amount,
    maxQuantity,
    onChainChange,
    quantity,
    onQuantityChange: setQuantity,
    hintMessage,
    inputStatus,
    disabled,
    onTokenChange,
    onDeposit,
    onApprove,
    dst,
    depositFee,
    price: 1,
    fee,
    nativeToken,
    loading,
    actionType,
    fetchBalance,
    balanceRevalidating,
    wrongNetwork,
    settingChain,
  };
};

export type UseFeeReturn = ReturnType<typeof useDepositFee>;

export function useDepositFee(options: {
  nativeToken?: API.TokenInfo;
  depositFee?: bigint;
}) {
  const { nativeToken, depositFee = 0 } = options;

  const nativeSymbol = nativeToken?.symbol;

  const { data: symbolPrice } = useIndexPrice(`SPOT_${nativeSymbol}_USDC`);

  const feeProps = useMemo(() => {
    const dstGasFee = new Decimal(depositFee.toString())
      .div(new Decimal(10).pow(18))
      .toString();

    const feeAmount = new Decimal(dstGasFee).mul(symbolPrice || 0).toString();

    return {
      dstGasFee,
      feeQty: dstGasFee,
      feeAmount,
      dp: feeDecimalsOffset(4),
    };
  }, [depositFee, symbolPrice]);

  return { ...feeProps, nativeSymbol };
}
