import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAccount } from "../useAccount";
import {
  API,
  ARBITRUM_MAINNET_CHAINID,
  ARBITRUM_TESTNET_CHAINID,
  AccountStatusEnum,
  DEPOSIT_FEE_RATE,
  NetworkId,
  isNativeTokenChecker,
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
    } else {
      chain = findByChainId(options?.srcChainId!) as API.Chain;
      // if is orderly un-supported chain
      if (!chain?.network_infos?.bridgeless) {
        // Orderly mainnet supported chain
        chain = findByChainId(ARBITRUM_MAINNET_CHAINID) as API.Chain;
      }
    }
    return chain;
  }, [networkId, findByChainId, options?.srcChainId]);

  const dst = useMemo(() => {
    if (!targetChain) {
      throw new Error("dst chain not found");
    }

    const USDC = targetChain?.token_infos.find(
      (token: API.TokenInfo) => token.symbol === "USDC"
    );

    return {
      symbol: "USDC",
      address: USDC?.address,
      decimals: USDC?.decimals,
      chainId: targetChain.network_infos.chain_id,
      network: targetChain.network_infos.shortName,
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
      tasks.push(account.assetsManager.getBalanceByAddress(token.address));
    }

    const balances = await Promise.all(tasks);

    // const balances = await account.assetsManager.getBalances(tokens);
    // setBalance(() => balances);
  }, []);

  const getAllowance = async (address?: string, vaultAddress?: string) => {
    // if (!address || !vaultAddress) return;
    const key = `${address}-${vaultAddress}`;

    if (prevAddress.current === key) return;

    if (!address || !vaultAddress) return;
    if (address && isNativeTokenChecker(address)) return;
    // if (allowanceRevalidating) return;
    // setAllowanceRevalidating(true);

    prevAddress.current = key;

    const allowance = await account.assetsManager.getAllowance(
      address,
      vaultAddress
    );

    setAllowance(() => allowance);
    // setAllowanceRevalidating(false);
    return allowance;
  };

  const getAllowanceByDefaultAddress = async (address?: string) => {
    if (prevAddress.current === address) return;

    if (!address || isNativeTokenChecker(address)) return;

    prevAddress.current = address;

    const allowance = await account.assetsManager.getAllowance(address);
    setAllowance(() => allowance);
  };

  const queryBalance = useDebouncedCallback(
    (tokenAddress?: string, decimals?: number) => {
      fetchBalance(options?.address, options?.decimals).finally(() => {
        setBalanceRevalidating(false);
      });
    },
    100
  );

  const queryAllowance = useDebouncedCallback(
    (tokenAddress?: string, vaultAddress?: string) => {
      getAllowance(tokenAddress, vaultAddress);
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

    if (dst.chainId !== options?.srcChainId) {
      queryAllowance(options?.address);
    } else {
      if (dst.symbol !== options?.srcToken) {
        queryAllowance(options?.address);
      } else {
        getAllowanceByDefaultAddress(options?.address);
      }
    }
  }, [
    state.status,
    options?.address,
    options?.srcChainId,
    options?.srcToken,
    account.address,
    dst.chainId,
    dst.symbol,
  ]);

  const updateAllowanceWhenTxSuccess = useCallback(
    (txHash: string) => {
      return account.walletClient
        ?.pollTransactionReceiptWithBackoff(txHash)
        .then((receipt) => {
          if (receipt.status === 1) {
            account.assetsManager
              .getAllowance(options?.address)
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
        .approve(options.address, amount)
        .then((result: any) => {
          return updateAllowanceWhenTxSuccess(result.hash);
        });
    },
    [account, getAllowance, options?.address, dst]
  );

  const deposit = useCallback(async () => {
    if (!options?.address) {
      throw new Error("address is required");
    }
    const _allowance = await account.assetsManager.getAllowance(
      options?.address
    );

    setAllowance(() => _allowance);

    if (new Decimal(quantity).greaterThan(_allowance)) {
      throw new Error("Insufficient allowance");
    }

    // only support orderly deposit
    return account.assetsManager
      .deposit(quantity, depositFee)
      .then((result: any) => {
        updateAllowanceWhenTxSuccess(result.hash);
        setBalance((value) => new Decimal(value).sub(quantity).toString());
        return result;
      });
  }, [account, fetchBalance, quantity, depositFee, options?.address]);

  const loopGetBalance = async () => {
    getBalanceListener.current && clearTimeout(getBalanceListener.current);
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
    }, 3000);
  };

  const getDepositFee = useCallback(
    async (quantity: string) => {
      return account.assetsManager.getDepositFee(
        quantity,
        targetChain?.network_infos
      );
    },
    [account, targetChain]
  );

  const enquiryDepositFee = useCallback(() => {
    if (isNaN(Number(quantity)) || !quantity) {
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
