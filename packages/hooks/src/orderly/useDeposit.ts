import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAccount } from "../useAccount";
import { useEventEmitter } from "../useEventEmitter";
import {
  AccountStatusEnum,
  API,
  ARBITRUM_MAINNET_CHAINID,
  ARBITRUM_TESTNET_CHAINID,
  ChainNamespace,
  DEPOSIT_FEE_RATE,
  isNativeTokenChecker,
  MaxUint256,
  NetworkId,
  EnumTrackerKeys,
} from "@orderly.network/types";
import { Decimal, isTestnet } from "@orderly.network/utils";
import { useChains } from "./useChains";
import { useConfig } from "../useConfig";
import { useDebouncedCallback } from "use-debounce";

export type useDepositOptions = {
  // from address
  address?: string;
  decimals?: number;
  networkId?: NetworkId;
  srcChainId?: number;
  srcToken?: string;
  quantity?: string;
};

export const useDeposit = (options?: useDepositOptions) => {
  const networkId = useConfig("networkId");
  const [balanceRevalidating, setBalanceRevalidating] = useState(false);
  const [allowanceRevalidating, setAllowanceRevalidating] = useState(false);
  const ee = useEventEmitter();
  const [_, { findByChainId }] = useChains(undefined);

  const [quantity, setQuantity] = useState<string>("");
  const [depositFee, setDepositFee] = useState<bigint>(0n);
  const [depositFeeRevalidating, setDepositFeeRevalidating] = useState(false);

  const [balance, setBalance] = useState("0");
  const [allowance, setAllowance] = useState("0");

  const { account, state } = useAccount();

  const prevAddress = useRef<string | undefined>();
  const getBalanceListener = useRef<ReturnType<typeof setTimeout>>();

  const targetChain = useMemo(() => {
    let chain: API.Chain | undefined;

    // Orderly testnet supported chain
    if (networkId === "testnet") {
      chain = findByChainId(
        isTestnet(options?.srcChainId!)
          ? options?.srcChainId!
          : ARBITRUM_TESTNET_CHAINID
      ) as API.Chain;
      console.log("--  chain", chain, options);
    } else {
      chain = findByChainId(options?.srcChainId!);
      // if is orderly un-supported chain
      if (!chain?.network_infos?.bridgeless) {
        // Orderly mainnet supported chain
        chain = findByChainId(ARBITRUM_MAINNET_CHAINID);
      }
    }
    return chain;
  }, [networkId, findByChainId, options?.srcChainId]);

  const dst = useMemo(() => {
    const USDC = targetChain?.token_infos.find(
      (token: API.TokenInfo) => token.symbol === "USDC"
    );

    return {
      symbol: "USDC",
      address: USDC?.address,
      decimals: USDC?.decimals,
      chainId: targetChain?.network_infos?.chain_id,
      network: targetChain?.network_infos?.shortName,
    };
  }, [targetChain]);

  const isNativeToken = useMemo(
    () => isNativeTokenChecker(options?.address || ""),
    [options?.address]
  );

  const fetchBalanceHandler = useCallback(
    async (address: string, decimals?: number) => {
      let balance: string;

      if (!!address && isNativeTokenChecker(address)) {
        balance = await account.assetsManager.getNativeBalance({
          decimals,
        });
      } else {
        balance = await account.assetsManager.getBalance(address, { decimals });
      }

      return balance;
    },
    []
  );

  const fetchBalance = useCallback(
    async (
      // token contract address
      address?: string,
      // format decimals
      decimals?: number
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
    [state]
  );

  const fetchBalances = useCallback(async (tokens: API.TokenInfo[]) => {
    const tasks = [];

    for (const token of tokens) {
      // native token skip
      if (isNativeTokenChecker(token.address)) {
        continue;
      }
      tasks.push(
        account.assetsManager.getBalanceByAddress(token.address, {
          decimals: token?.decimals,
        })
      );
    }

    const balances = await Promise.all(tasks);

    // const balances = await account.assetsManager.getBalances(tokens);
    // setBalance(() => balances);
  }, []);

  const getAllowance = async (inputs: {
    address?: string;
    vaultAddress?: string;
    decimals?: number;
  }) => {
    const { address, vaultAddress, decimals } = inputs;
    const key = `${address}-${vaultAddress}`;
    console.log("--- get allowance", vaultAddress);

    if (prevAddress.current === key) return;

    if (!address || !vaultAddress) return;
    if (address && isNativeTokenChecker(address)) return;
    // if (allowanceRevalidating) return;
    // setAllowanceRevalidating(true);

    prevAddress.current = key;

    const allowance = await account.assetsManager.getAllowance({
      address,
      vaultAddress,
      decimals,
    });

    setAllowance(() => allowance);
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
    setAllowance(() => allowance);
  };

  const queryBalance = useDebouncedCallback(
    (address?: string, decimals?: number) => {
      fetchBalance(address, decimals).finally(() => {
        setBalanceRevalidating(false);
      });
    },
    100
  );

  const queryAllowance = useDebouncedCallback(
    (inputs: {
      address?: string;
      vaultAddress?: string;
      decimals?: number;
    }) => {
      getAllowance(inputs);
    },
    100
  );

  useEffect(() => {
    if (state.status < AccountStatusEnum.Connected) return;
    setBalanceRevalidating(true);
    // fetchBalance(options?.address, options?.decimals).finally(() => {
    //   setBalanceRevalidating(false);
    // });

    queryBalance(options?.address, options?.decimals);

    const params = {
      address: options?.address,
      decimals: options?.decimals,
    };

    if (account.walletAdapter?.chainNamespace === ChainNamespace.solana) {
      setAllowance(account.walletAdapter.formatUnits(MaxUint256));
      return;
    }
    console.log(
      "-- dst chainid",
      dst.chainId,
      options?.srcChainId,
      dst,
      options
    );
    if (dst.chainId !== options?.srcChainId) {
      queryAllowance(params);
    } else {
      if (dst.symbol !== options?.srcToken) {
        queryAllowance(params);
      } else {
        getAllowanceByDefaultAddress(params);
      }
    }
  }, [
    state.status,
    options?.address,
    options?.srcChainId,
    options?.srcToken,
    options?.decimals,
    account.address,
    dst.chainId,
    dst.symbol,
  ]);

  const updateAllowanceWhenTxSuccess = useCallback(
    (txHash: string) => {
      return account.walletAdapter
        ?.pollTransactionReceiptWithBackoff(txHash)
        .then((receipt) => {
          if (receipt.status === 1) {
            account.assetsManager
              .getAllowance({ address: options?.address })
              .then((allowance) => {
                setAllowance(() => allowance);
              });
          }
        });
    },
    [account, options?.address]
  );

  const approve = useCallback(
    async (amount?: string) => {
      if (!options?.address) {
        throw new Error("address is required");
      }
      return account.assetsManager
        .approve({
          address: options.address,
          amount,
        })
        .then((res: any) => {
          return updateAllowanceWhenTxSuccess(res.hash);
        })
        .catch((e) => {});
    },
    [account, getAllowance, options?.address, dst]
  );

  const deposit = useCallback(async () => {
    if (!options?.address) {
      throw new Error("address is required");
    }
    const _allowance = await account.assetsManager.getAllowance({
      address: options?.address,
    });

    setAllowance(() => _allowance);

    if (new Decimal(quantity).greaterThan(_allowance)) {
      throw new Error("Insufficient allowance");
    }

    // only support orderly deposit
    console.log("-- start deposit");
    console.log("-- deposit fee", depositFee);

    return account.assetsManager
      .deposit(quantity, depositFee)
      .then((res: any) => {
        ee.emit(EnumTrackerKeys.DEPOSIT_SUCCESS, {
          wallet: state?.connectWallet?.name,
          network: targetChain?.network_infos.name,
          quantity,
        });
        updateAllowanceWhenTxSuccess(res.hash);
        setBalance((value) => new Decimal(value).sub(quantity).toString());
        return res;
      })
      .catch((e) => {
        ee.emit(EnumTrackerKeys.DEPOSIT_FAILED, {
          wallet: state?.connectWallet?.name,
          network: targetChain?.network_infos?.name,
          msg: JSON.stringify(e),
        });
        throw e;
      });
  }, [account, fetchBalance, quantity, depositFee, options?.address]);

  const loopGetBalance = async () => {
    getBalanceListener.current && clearTimeout(getBalanceListener.current);
    const time =
      account.walletAdapter?.chainNamespace === ChainNamespace.solana
        ? 10000
        : 3000;
    getBalanceListener.current = setTimeout(async () => {
      try {
        const balance = await fetchBalanceHandler(
          options?.address!,
          options?.decimals
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
      return account.assetsManager.getDepositFee(
        quantity,
        targetChain?.network_infos!
      );
    },
    [account, targetChain]
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
            .toString()
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
    if (!options?.address) {
      return;
    }

    loopGetBalance();

    return () => {
      getBalanceListener.current && clearTimeout(getBalanceListener.current);
    };

    // account.walletClient.on(
    //   // {
    //   //   address: options?.address,
    //   // },
    //   "block",
    //   (log: any, event: any) => {
    //     console.log("account.walletClient.on", log, event);
    //   }
    // );
  }, [options?.address, options?.decimals]);

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
    fetchBalances,
    fetchBalance: fetchBalanceHandler,
    /** set input quantity */
    setQuantity,
  };
};
