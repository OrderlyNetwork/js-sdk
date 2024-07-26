import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useChains,
  useConfig,
  useDeposit,
  useWalletConnector,
} from "@orderly.network/hooks";
import { API, NetworkId } from "@orderly.network/types";
import { Decimal, int2hex, praseChainIdToNumber } from "@orderly.network/utils";
import { toast } from "@orderly.network/ui";

export type InputStatus = "error" | "warning" | "success" | "default";

export type UseDepositFormScriptReturn = ReturnType<
  typeof useDepositFormScript
>;

export type UseDepositFormScriptOptions = {
  onCancel?: () => void;
  onOk?: (data: any) => void;
};

export const useDepositFormScript = (options: UseDepositFormScriptOptions) => {
  const [inputStatus, setInputStatus] = useState<InputStatus>("default");
  const [hintMessage, setHintMessage] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [token, setToken] = useState<API.TokenInfo>();
  const [tokens, setTokens] = useState<API.TokenInfo[]>([]);

  const config = useConfig();
  const networkId = config.get("networkId") as NetworkId;

  const [chains, { findByChainId }] = useChains(networkId, {
    pick: "network_infos",
    filter: (chain: any) =>
      chain.network_infos?.bridge_enable || chain.network_infos?.bridgeless,
  });

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
    balance: maxAmount,
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
        options?.onOk?.(res);
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
  }, [quantity, submitting, onDirectDeposit]);

  const onApprove = useCallback(async () => {
    return approve(quantity);
  }, [quantity, approve]);

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

  const getTokenByTokenList = (tokens: API.TokenInfo[] = []) => {
    const tokenObj = tokens.reduce((acc, item) => {
      acc[item.symbol] = item;
      return acc;
    }, {} as any);

    return tokenObj["USDC"] || tokenObj["USDbC"] || tokens[0];
  };

  // when chain changed and chain data ready then call this function
  const onChainInited = useCallback(
    (chainInfo?: API.Chain) => {
      if (chainInfo && chainInfo?.token_infos?.length > 0) {
        const tokens = chainInfo.token_infos;
        setTokens(tokens);

        const newToken = getTokenByTokenList(tokens);

        if (!newToken || newToken.symbol === token?.symbol) return;

        setToken(newToken);
      }
    },
    [token?.symbol]
  );

  useEffect(() => {
    onChainInited(currentChain?.info);
  }, [currentChain, token?.symbol]);

  useEffect(() => {
    if (!quantity) {
      // reset input status when value is empty
      setInputStatus("default");
      setHintMessage("");
      return;
    }

    const d = new Decimal(quantity);

    if (d.gt(maxAmount)) {
      setInputStatus("error");
      setHintMessage("Insufficient balance");
    } else {
      // reset input status
      setInputStatus("default");
      setHintMessage("");
    }
  }, [quantity, maxAmount]);

  const disabled =
    !quantity || inputStatus === "error" || depositFeeRevalidating!;

  return {
    walletName,
    address,
    token,
    tokens,
    brokerId: config.get("brokerId"),
    brokerName: config.get("brokerName") || "",
    chains,
    currentChain,
    maxAmount,
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
  };
};
