import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useChains,
  useConfig,
  useLocalStorage,
  useWalletConnector,
} from "@orderly.network/hooks";
import { API, NetworkId } from "@orderly.network/types";
import { Decimal, int2hex, praseChainIdToNumber } from "@orderly.network/utils";
import { modal, toast } from "@orderly.network/ui";
import { useAppContext } from "@orderly.network/react-app";
import { ActionType } from "@orderly.network/ui-transfer";
import { useDeposit } from "../../woo/useDeposit";
import { useSwapEnquiry } from "../../hooks/useSwapEnquiry";
import { SwapType } from "../../type";
import { getTokenByTokenList } from "../../utils";
import { useNeedSwapAndCross } from "../../hooks/useNeedSwapAndCross";
import { useSwapFee } from "../../hooks/useSwapFee";
import { SwapDialog } from "../swap/swapDialog";
import { SwapMode } from "../../types";

export type InputStatus = "error" | "warning" | "success" | "default";

export type UseCrossDepositFormScriptReturn = ReturnType<
  typeof useCrossDepositFormScript
>;

export type UseDepositFormScriptOptions = {
  onCancel?: () => void;
  onOk?: (data: any) => void;
};

export const useCrossDepositFormScript = (
  options?: UseDepositFormScriptOptions
) => {
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

  const [slippage, setSlippage] = useLocalStorage("ORDERLY_SLIPPAGE", 1);

  const { needSwap, needCrossSwap } = useNeedSwapAndCross({
    symbol: token?.symbol,
    srcChainId: currentChain?.id,
    dstChainId: dst?.chainId,
  });

  const {
    enquiry,
    transactionInfo,
    amount: swapAmount,
    querying: swapRevalidating,
    warningMessage,
    cleanTransactionInfo,
  } = useSwapEnquiry({
    quantity,
    dst,
    queryParams: {
      network: dst.network,
      srcToken: token?.address,
      srcNetwork: currentChain?.info?.network_infos?.shortName,
      dstToken: dst.address,
      crossChainRouteAddress: (
        currentChain?.info?.network_infos as SwapType.NetworkInfos
      )?.woofi_dex_cross_chain_router,
      amount: new Decimal(quantity || 0)
        .mul(10 ** (token?.decimals || 0))
        .toString(),
      slippage,
    },
    needSwap,
    needCrossSwap,
  });

  const onSwapDeposit = useCallback(() => {
    const params = {
      mode: needCrossSwap ? SwapMode.Cross : SwapMode.Single,
      src: {
        chain: 56,
        token: "BNB",
        displayDecimals: 3,
        amount: "0.224700501895331354",
        decimals: 18,
      },
      dst: {
        chain: 42161,
        token: "USDC",
        displayDecimals: 2,
        amount: "131.4744",
        decimals: 6,
      },
      chain: {
        name: "BNB Chain",
        public_rpc_url: "https://bsc-dataseed.binance.org",
        chain_id: 56,
        currency_symbol: "BNB",
        bridge_enable: true,
        mainnet: true,
        explorer_base_url: "https://bscscan.com/",
        est_txn_mins: 2,
        woofi_dex_cross_chain_router:
          "0xac8951A442fe70342f9597044B7b7657D5ad55ec",
        woofi_dex_depositor: null,
        bridgeless: false,
        shortName: "bsc",
      },
      nativeToken: {
        address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        symbol: "BNB",
        decimals: 18,
        woofi_dex_precision: 3,
        swap_enable: true,
        precision: 3,
      },
      depositFee: 0n,
      transactionData: {
        dst_outcomes: {
          token: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
          symbol: "USDC",
          decimals: 6,
          amount: "131474400",
        },
        fees_from: {
          woofi: "0.000067339180689675",
          stargate: "0.000224455929647260",
          total: "0.000291795110336935",
        },
        mark_prices: {
          from_token: 586.3354959999999,
          native_token: 586.3354959999999,
        },
        price: 585.1095075045388,
        route_infos: {
          src: {
            tokens: [
              "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
              "0x55d398326f99059fF775485246999027B3197955",
            ],
            symbols: ["BNB", "USDT"],
            amounts: ["224700501895331354", "131620160957145151463"],
            decimals: [18, 18],
          },
          dst: {
            tokens: [
              "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
              "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
            ],
            symbols: ["USDC.e", "USDC"],
            amounts: ["131488540", "131474400"],
            decimals: [6, 6],
          },
        },
        src_infos: {
          network: "bsc",
          from_token: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
          from_amount: "224700501895331354",
          bridge_token: "0x55d398326f99059fF775485246999027B3197955",
          min_bridge_amount: "130962060152359419904",
        },
        dst_infos: {
          network: "arbitrum",
          chain_id: 110,
          bridged_token: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
          to_token: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
          min_to_amount: "130817028",
          gas_fee: "0.000634682448877203",
        },
      },
      slippage: 1,
      brokerName: "Orderly",
    };
    // return modal.show(SwapDialog, params);
    enquiry()
      .then((transaction) => {
        const amountValue = needCrossSwap
          ? transaction.route_infos?.dst.amounts[1]
          : transaction.route_infos?.amounts[1];

        // @ts-ignore
        return modal.show(SwapDialog, {
          mode: needCrossSwap ? SwapMode.Cross : SwapMode.Single,
          src: {
            chain: currentChain?.id,
            token: token!.symbol,
            displayDecimals: (token as SwapType.TokenInfo)!.woofi_dex_precision,
            amount: quantity,
            decimals: token!.decimals,
          },
          dst: {
            chain: dst.chainId,
            token: dst.symbol,
            displayDecimals: 2,
            amount: new Decimal(amountValue)
              .div(Math.pow(10, dst.decimals!))
              .toString(),
            decimals: dst.decimals,
          },
          chain: currentChain?.info?.network_infos,
          nativeToken: currentChain?.info.nativeToken,
          depositFee,
          transactionData: transaction,
          slippage,
          brokerName,
        });
      })
      .then((isSuccss) => {
        if (isSuccss) {
          cleanData();
        }
      })
      .catch((error) => {
        // toast.error(error?.message || "Error");
      })
      .finally(() => {
        setSubmitting(false);
      });
  }, [
    quantity,
    needCrossSwap,
    dst,
    currentChain,
    slippage,
    depositFee,
    brokerName,
  ]);

  const cleanData = () => {
    cleanTransactionInfo();
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
    // onSwapDeposit();
    // return;
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
    if (needSwap || needCrossSwap) {
      onSwapDeposit();
    } else {
      onDirectDeposit();
    }
  }, [
    quantity,
    submitting,
    token,
    onDirectDeposit,
    needSwap,
    needCrossSwap,
    onSwapDeposit,
  ]);

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
    depositFeeRevalidating! ||
    swapRevalidating;

  const loading = submitting || depositFeeRevalidating! || swapRevalidating;

  const markPrice = useMemo(() => {
    if (needCrossSwap || needSwap) {
      return isNativeToken
        ? transactionInfo.markPrices.native_token
        : transactionInfo.markPrices.from_token;
    }

    return 1;
  }, [needSwap, needCrossSwap, isNativeToken, transactionInfo]);

  const swapPrice = useMemo(() => {
    if (needCrossSwap || needSwap) {
      return transactionInfo.price;
    }
    return 1;
  }, [transactionInfo]);

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

  const fee = useSwapFee({
    nativeToken,
    isNativeToken,
    src: token,
    depositFee,
    transactionInfo,
    needSwap,
    needCrossSwap,
  });

  const swapQuantity = needSwap || needCrossSwap ? swapAmount : quantity;

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
    onSlippageChange: setSlippage,
    slippage,
    needSwap,
    needCrossSwap,
    swapQuantity,
    swapPrice,
    swapRevalidating,
  };
};
