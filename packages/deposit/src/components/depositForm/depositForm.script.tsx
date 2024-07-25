import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  useChains,
  useConfig,
  useDeposit,
  useWalletConnector,
} from "@orderly.network/hooks";
import { API, Chain, NetworkId } from "@orderly.network/types";
import { Decimal, int2hex, praseChainIdToNumber } from "@orderly.network/utils";
// import { OrderlyAppContext } from "@orderly.network/react";
import { toast } from "@orderly.network/ui";

export type InputStatus = "error" | "warning" | "success" | "default";

export type UseDepositFormScriptReturn = ReturnType<
  typeof useDepositFormScript
>;

export type UseDepositFormScriptOptions = {
  onCancel?: () => void;
  onOk?: () => void;
};

export type CurrentChain = {
  id: number;
  info: Chain;
};

export const useDepositFormScript = (options: UseDepositFormScriptOptions) => {
  const config = useConfig();

  const [chains, { findByChainId }] = useChains(
    config.get("networkId") as NetworkId,
    {
      pick: "network_infos",
      filter: (chain: any) =>
        chain.network_infos?.bridge_enable || chain.network_infos?.bridgeless,
    }
  );

  const {
    connectedChain,
    wallet,
    setChain: switchChain,
    settingChain,
  } = useWalletConnector();

  const [token, setToken] = useState<API.TokenInfo>();

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

  const address = useMemo(() => {
    const add = wallet?.accounts?.[0].address;
    if (!add) return "--";
    return add.replace(/^(.{6})(.*)(.{4})$/, "$1......$3");
  }, [wallet]);

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

  // const { errors, brokerName, customChains } = useContext(OrderlyAppContext);

  const [inputStatus, setInputStatus] = useState<InputStatus>("default");
  const [hintMessage, setHintMessage] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  const [tokens, setTokens] = useState<API.TokenInfo[]>([]);

  const cleanData = () => {
    setQuantity("");
  };

  const onDirectDeposit = useCallback(() => {
    deposit()
      .then((res: any) => {
        setQuantity("");
        toast.success("Deposit requested");
        // @ts-ignore
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

  const onValueChange = useCallback(
    (value: any) => {
      if (value.value === ".") {
        setQuantity("0.");
        return;
      }

      const NumberReg = /^([0-9]{1,}[.]?[0-9]*)/;
      const result = (value.value as string).match(NumberReg);

      if (Array.isArray(result)) {
        value = result[0];
        if (isNaN(parseFloat(value))) {
          setQuantity("");
        } else {
          let d = new Decimal(value);
          if (d.dp() > dst.decimals!) {
            setQuantity(d.todp(Math.min(dst.decimals!, 8)).toString());
          } else {
            setQuantity(value);
          }

          if (d.gt(maxAmount)) {
            setInputStatus("error");
            setHintMessage("Insufficient balance");
          } else {
            // reset input status
            setInputStatus("default");
            setHintMessage("");
          }
        }
      } else {
        setQuantity("");
        // reset input status when value is empty
        setInputStatus("default");
        setHintMessage("");
      }
    },
    [dst.decimals, maxAmount]
  );

  const onTokenChange = (token: API.TokenInfo) => {
    cleanData();
    setToken(token);
    // props.switchToken?.(token);
  };

  const onChainChange = useCallback(
    (value: API.Chain) => {
      if (!value) return;
      if (value.network_infos?.chain_id === currentChain?.id)
        return Promise.resolve();

      switchChain?.({
        chainId: int2hex(Number(value.network_infos?.chain_id)),
        // @ts-ignore
        rpcUrl: value.network_infos?.public_rpc_url,
        token: value.network_infos?.currency_symbol,
        // name: chain.network_infos?.name,
        label: value.network_infos?.name,
      })
        .then((switched) => {
          if (!switched) {
            toast.error("Switch chain failed");
            return;
          }
          // switch success，set tokens list
          setTokens(value?.token_infos ?? []);

          // switch chain need to update chain token
          const token = getTokenByTokenList(value?.token_infos);
          if (token) {
            setToken(token);
            // props.switchToken?.(token);
          }

          toast.success("Network switched");
          cleanData();
        })
        .catch((error) => {
          toast.error(`Switch chain failed: ${error.message}`);
        });
    },
    [switchChain, currentChain, token?.symbol]
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
    (chain: API.Chain) => {
      if (chain && chain.token_infos?.length > 0) {
        const tokens = chain.token_infos;
        const _token = getTokenByTokenList(tokens);

        if (!_token || _token.symbol === token?.symbol) return;

        setTokens(tokens);

        if (!_token) return;

        setToken(_token);
        // props.switchToken?.(token);
      }
    },
    [token?.symbol]
  );

  useEffect(() => {
    if (!currentChain) {
      return;
    }
    const chainInfo = findByChainId(currentChain.id);
    onChainInited(chainInfo!);
  }, [currentChain, findByChainId]);

  useEffect(() => {
    // check quantity
    if (isNaN(Number(quantity)) || !quantity) return;

    const d = new Decimal(quantity);

    if (d.gt(maxAmount)) {
      setInputStatus("error");
      setHintMessage("Insufficient balance");
    } else {
      setInputStatus("default");
      setHintMessage("");
    }
  }, [maxAmount]);

  return {
    walletName: wallet?.label,
    address,
    token,
    tokens,
    brokerId: config.get("brokerId"),
    brokerName: config.get("brokerName"),
    chains,
    currentChain,
    maxAmount,
  };
};
