import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import {
  API,
  ARBITRUM_MAINNET_CHAINID,
  ARBITRUM_TESTNET_CHAINID,
  AccountStatusEnum,
  ChainNamespace,
  DEPOSIT_FEE_RATE,
  MaxUint256,
  NetworkId,
  SDKError,
  TrackerEventName,
  isNativeTokenChecker,
} from "@orderly.network/types";
import { Decimal, isTestnet } from "@orderly.network/utils";
import { useAccount } from "../useAccount";
import { useConfig } from "../useConfig";
import { useTrack } from "../useTrack";
import { useChains } from "./useChains";

export type DepositOptions = {
  // from address
  address?: string;
  decimals?: number;

  srcChainId?: number;
  srcToken?: string;
  dstToken?: string;

  // swap deposit options
  swapEnable?: boolean;
  crossChainRouteAddress?: string;
  depositorAddress?: string;

  /** @deprecated unused, will be removed in the future */
  networkId?: NetworkId;
};

export type DepositReturn = ReturnType<typeof useDeposit>;

export const useDeposit = (options: DepositOptions) => {
  const networkId = useConfig("networkId");
  const [balanceRevalidating, setBalanceRevalidating] = useState(false);
  const [allowanceRevalidating, setAllowanceRevalidating] = useState(false);

  const [_, { findByChainId }] = useChains(undefined);

  const [quantity, setQuantity] = useState<string>("");
  const [depositFee, setDepositFee] = useState<bigint>(0n);
  const [depositFeeRevalidating, setDepositFeeRevalidating] = useState(false);

  const [balance, setBalance] = useState("0");
  const [allowance, setAllowance] = useState("0");

  const { account, state } = useAccount();
  const { track } = useTrack();

  const prevAddress = useRef<string | undefined>();
  const getBalanceListener = useRef<ReturnType<typeof setTimeout>>();

  const targetChain = useMemo(() => {
    let chain: API.Chain | undefined;

    // Orderly testnet supported chain
    if (networkId === "testnet") {
      chain = findByChainId(
        isTestnet(options.srcChainId!)
          ? options.srcChainId!
          : ARBITRUM_TESTNET_CHAINID,
      ) as API.Chain;
    } else {
      chain = findByChainId(options.srcChainId!) as API.Chain;
      // if is orderly un-supported chain
      if (!chain?.network_infos?.bridgeless) {
        // Orderly mainnet supported chain
        chain = findByChainId(ARBITRUM_MAINNET_CHAINID) as API.Chain;
      }
    }
    return chain;
  }, [networkId, findByChainId, options.srcChainId]);

  const dst = useMemo(() => {
    const USDC = targetChain?.token_infos.find(
      (token) => token.symbol === "USDC",
    );

    return {
      symbol: "USDC",
      address: USDC?.address,
      decimals: USDC?.decimals,
      chainId: targetChain?.network_infos.chain_id,
      network: targetChain?.network_infos.shortName,
    };
  }, [targetChain]);

  const isNativeToken = useMemo(
    () => isNativeTokenChecker(options.address || ""),
    [options.address],
  );

  const fetchBalanceHandler = useCallback(
    async (address: string, decimals?: number) => {
      let balance: string;

      if (address && isNativeTokenChecker(address)) {
        balance = await account.assetsManager.getNativeBalance({
          decimals,
        });
      } else {
        balance = await account.assetsManager.getBalance(address, { decimals });
      }

      return balance;
    },
    [],
  );

  const fetchBalance = useCallback(
    async (
      // token contract address
      address?: string,
      // format decimals
      decimals?: number,
    ) => {
      if (!address) return;

      try {
        // if (balanceRevalidating) return;
        const balance = await fetchBalanceHandler(address, decimals);

        setBalance(() => balance);
      } catch (e) {
        console.warn("----- refresh balance error -----", e);

        setBalance(() => "0");
      }
    },
    [state],
  );

  const fetchBalances = useCallback(async (tokens: API.TokenInfo[]) => {
    const tasks = [];

    for (const token of tokens) {
      // skip native token
      if (isNativeTokenChecker(token.address)) {
        continue;
      }

      tasks.push(
        account.assetsManager.getBalanceByAddress(token.address, {
          decimals: token?.decimals,
        }),
      );
    }

    const balances = await Promise.all(tasks);

    return balances;
  }, []);

  const getAllowance = async (inputs: {
    address?: string;
    vaultAddress?: string;
    decimals?: number;
  }) => {
    const { address, vaultAddress, decimals } = inputs;
    const key = `${address}-${vaultAddress}`;

    if (prevAddress.current === key) return;

    if (!address || !vaultAddress) return;

    // native token don't need to get allowance and approve
    if (isNativeTokenChecker(address)) return;

    prevAddress.current = key;

    const allowance = await account.assetsManager.getAllowance({
      address,
      vaultAddress,
      decimals,
    });

    setAllowance(allowance);
    // setAllowanceRevalidating(false);
    return allowance;
  };

  const getAllowanceByDefaultAddress = async (inputs: {
    address?: string;
    decimals?: number;
  }) => {
    const { address, decimals } = inputs;
    if (prevAddress.current === address) return;

    if (!address || isNativeTokenChecker(address)) return;

    prevAddress.current = address;

    const allowance = await account.assetsManager.getAllowance({
      address,
      decimals,
    });

    setAllowance(allowance);
    return allowance;
  };

  const vaultAddress = useMemo(() => {
    if (dst.chainId !== options.srcChainId) {
      return options.crossChainRouteAddress;
    } else {
      if (dst.symbol !== options.srcToken) {
        return options.depositorAddress;
      }
    }
  }, [
    dst.chainId,
    dst.symbol,
    options.srcChainId,
    options.srcToken,
    options.crossChainRouteAddress,
    options.depositorAddress,
  ]);

  const queryBalance = useDebouncedCallback(
    (address?: string, decimals?: number) => {
      fetchBalance(address, decimals).finally(() => {
        setBalanceRevalidating(false);
      });
    },
    100,
  );

  const queryAllowance = useDebouncedCallback(
    (inputs: {
      address?: string;
      vaultAddress?: string;
      decimals?: number;
    }) => {
      getAllowance(inputs);
    },
    100,
  );

  useEffect(() => {
    if (state.status < AccountStatusEnum.Connected) return;

    setBalanceRevalidating(true);
    queryBalance(options.address, options.decimals);

    // solana don't need to get allowance, set allowance to max uint256
    if (account.walletAdapter?.chainNamespace === ChainNamespace.solana) {
      setAllowance(
        account.walletAdapter.formatUnits(MaxUint256, options.decimals!),
      );
      return;
    }

    if (vaultAddress && options.address) {
      queryAllowance({
        address: options.address,
        decimals: options.decimals,
        vaultAddress,
      });
    } else {
      getAllowanceByDefaultAddress({
        address: options.address,
        decimals: options.decimals,
      });
    }
  }, [
    state.status,
    options.address,
    options.decimals,
    account.address,
    vaultAddress,
  ]);

  const updateAllowanceWhenTxSuccess = useCallback(
    (txHash: string) => {
      return account.walletAdapter
        ?.pollTransactionReceiptWithBackoff(txHash)
        .then((receipt) => {
          if (receipt.status === 1) {
            account.assetsManager
              .getAllowance({
                address: options.address,
                decimals: options.decimals,
                vaultAddress,
              })
              .then((allowance) => {
                setAllowance(allowance);
              });
          }
        });
    },
    [account, options.address, options.decimals, vaultAddress],
  );

  // TODO: get allowance for cross chain
  const enquireAllowance = useCallback(async () => {
    // only check allowance for non-native token
    if (isNativeToken) {
      return;
    }

    if (!options.address) {
      throw new Error("address is required");
    }

    const _allowance = await account.assetsManager.getAllowance({
      address: options.address,
      vaultAddress,
      decimals: options.decimals,
    });

    setAllowance(_allowance);

    if (new Decimal(quantity).greaterThan(_allowance)) {
      throw new SDKError("Insufficient allowance");
    }

    return _allowance;
  }, [
    account,
    options.address,
    options.decimals,
    vaultAddress,
    quantity,
    isNativeToken,
  ]);

  const approve = useCallback(
    async (amount?: string) => {
      if (!options.address) {
        throw new Error("address is required");
      }

      return account.assetsManager
        .approve({
          address: options.address,
          amount,
          vaultAddress,
          decimals: options.decimals!,
        })
        .then((result: any) => {
          return updateAllowanceWhenTxSuccess(result.hash);
        });
    },
    [
      account,
      options.address,
      options.decimals,
      vaultAddress,
      updateAllowanceWhenTxSuccess,
    ],
  );

  // only support orderly deposit
  const deposit = useCallback(async () => {
    await enquireAllowance();

    const amount = account.walletAdapter?.parseUnits(
      quantity,
      options.decimals!,
    );
    // if native token, fee is amount + depositFee, TODO: move it to assets
    const fee = isNativeToken ? BigInt(amount!) + depositFee : depositFee;

    return account.assetsManager
      .deposit({
        amount: quantity,
        fee,
        decimals: options.decimals!,
        token: options.dstToken,
      })
      .then((result: any) => {
        updateAllowanceWhenTxSuccess(result.hash);
        setBalance((value) => new Decimal(value).sub(quantity).toString());

        track(TrackerEventName.depositSuccess, {
          wallet: state?.connectWallet?.name,
          network: targetChain?.network_infos.name,
          quantity,
        });
        return result;
      })
      .catch((e) => {
        track(TrackerEventName.depositFailed, {
          wallet: state?.connectWallet?.name,
          network: targetChain?.network_infos?.name,
          msg: JSON.stringify(e),
        });
        throw e;
      });
  }, [
    state,
    account,
    quantity,
    depositFee,
    targetChain,
    options.decimals,
    options.dstToken,
    enquireAllowance,
    updateAllowanceWhenTxSuccess,
    isNativeToken,
  ]);

  // get balance every 3s or 10s depends on chain namespace
  const loopGetBalance = async () => {
    if (getBalanceListener.current) {
      clearTimeout(getBalanceListener.current);
    }

    const time =
      account.walletAdapter?.chainNamespace === ChainNamespace.solana
        ? 10000
        : 3000;

    getBalanceListener.current = setTimeout(async () => {
      try {
        const balance = await fetchBalanceHandler(
          options.address!,
          options.decimals,
        );

        setBalance(balance);
        loopGetBalance();
      } catch (err) {
        console.log("fetchBalanceHandler error", err);
      }
    }, time);
  };

  const getDepositFee = useCallback(
    async (quantity: string) => {
      return account.assetsManager.getDepositFee({
        amount: quantity,
        chain: targetChain?.network_infos!,
        decimals: options.decimals!,
        token: options.dstToken,
      });
    },
    [account, targetChain, options.decimals, options.dstToken],
  );

  const enquiryDepositFee = useCallback(() => {
    if (isNaN(Number(quantity)) || !quantity || Number(quantity) === 0) {
      setDepositFee(0n);
      setDepositFeeRevalidating(false);
      return;
    }

    setDepositFeeRevalidating(true);

    getDepositFee(quantity)
      .then((res: bigint = 0n) => {
        const fee = BigInt(
          new Decimal(res.toString())
            .mul(DEPOSIT_FEE_RATE)
            .toFixed(0, Decimal.ROUND_UP)
            .toString(),
        );

        setDepositFee(fee);
        console.log("getDepositFee", fee);
      })
      .catch((error) => {
        console.error("getDepositFee", error);
      })
      .finally(() => {
        setDepositFeeRevalidating(false);
      });
  }, [quantity]);

  useEffect(() => {
    enquiryDepositFee();
  }, [quantity]);

  useEffect(() => {
    if (!options.address) {
      return;
    }

    loopGetBalance();

    return () => {
      if (getBalanceListener.current) {
        clearTimeout(getBalanceListener.current);
      }
    };
  }, [options.address, options.decimals]);

  return {
    /** orderly support chain dst */
    dst,
    balance,
    allowance,
    isNativeToken,
    balanceRevalidating,
    allowanceRevalidating,
    /** input quantiy */
    quantity,
    /** orderly deposit fee, unit: wei */
    depositFee,
    /** enquiring depositFee status on chain */
    depositFeeRevalidating,
    approve,
    deposit,
    fetchBalance: fetchBalanceHandler,
    fetchBalances,
    /** set input quantity */
    setQuantity,
  };
};
