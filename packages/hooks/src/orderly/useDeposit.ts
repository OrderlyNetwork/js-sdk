import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import {
  API,
  ARBITRUM_MAINNET_CHAINID,
  ARBITRUM_TESTNET_CHAINID,
  AccountStatusEnum,
  ChainNamespace,
  DEPOSIT_FEE_RATE,
  ETHEREUM_MAINNET_CHAINID,
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
  /** input token */
  srcToken?: string;
  /** output token */
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
  const balanceRef = useRef<string>("");

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

      try {
        if (address && isNativeTokenChecker(address)) {
          balance = await account.assetsManager.getNativeBalance({
            decimals,
          });
        } else {
          balance = await account.assetsManager.getBalance(address, {
            decimals,
          });
        }
      } catch (err: any) {
        if (
          ignoreBalanceError({
            token: options.srcToken!,
            chainNamespace: account.walletAdapter?.chainNamespace!,
            err,
          })
        ) {
          console.log("ignore balance error: ", err);
          return "0";
        }
        throw err;
      }

      return balance!;
    },
    [options.srcToken, account],
  );

  const fetchBalances = useCallback(async (tokens: API.TokenInfo[]) => {
    const tasks = [];

    for (const token of tokens) {
      // skip native token
      if (isNativeTokenChecker(token.address!)) {
        continue;
      }

      tasks.push(
        account.assetsManager.getBalance(token.address!, {
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
    console.log("allowance", allowance);

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
      vaultAddress,
    });

    setAllowance(allowance);
    return allowance;
  };

  const vaultAddress = useMemo(() => {
    // cross swap deposit vault address
    if (dst.chainId !== options.srcChainId) {
      return options.crossChainRouteAddress;
    }

    // swap deposit vault address
    if (options.srcToken !== (options.dstToken || dst.symbol)) {
      return options.depositorAddress;
    }

    // target chain vault address
    return targetChain?.network_infos.vault_address;
  }, [
    dst,
    options.srcChainId,
    options.srcToken,
    options.dstToken,
    options.crossChainRouteAddress,
    options.depositorAddress,
    targetChain,
  ]);

  const queryBalance = useDebouncedCallback(
    (address?: string, decimals?: number) => {
      fetchBalanceHandler(address!, decimals).then((balance) => {
        setBalance(balance);
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
                address: options.address!,
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

  const checkIfChainTokenNeedRestApprove = useCallback(
    (chainId: number, token: string) => {
      // check chain (except ethereum mainnet)
      if (chainId !== ETHEREUM_MAINNET_CHAINID) {
        return false;
      }
      if (token !== "USDT") {
        return false;
      }
      return true;
    },
    [],
  );

  const resetApprove = useCallback(
    async (tokenAddress: string, decimal: number, vaultAddress: string) => {
      const result = await account.assetsManager.approve({
        address: tokenAddress,
        amount: "0",
        vaultAddress,
        decimals: decimal,
      });

      const txResult: any =
        await account.walletAdapter?.pollTransactionReceiptWithBackoff(
          result.hash,
        );
      if (txResult && txResult.status === 1) {
        account.assetsManager
          .getAllowance({
            address: tokenAddress,
            decimals: decimal,
            vaultAddress,
          })
          .then((allowance) => {
            setAllowance(allowance);
          });
      }
    },
    [],
  );

  const approve = useCallback(
    async (amount?: string) => {
      if (!options.address) {
        throw new Error("address is required");
      }

      let isSetMaxValue = false;

      if (
        checkIfChainTokenNeedRestApprove(options.srcChainId!, options.srcToken!)
      ) {
        isSetMaxValue = true;
        if (allowance && new Decimal(allowance).gt(0)) {
          await resetApprove(
            options.address!,
            options.decimals!,
            vaultAddress!,
          );
        }
      }
      return account.assetsManager
        .approve({
          address: options.address,
          amount,
          vaultAddress,
          isSetMaxValue,
          decimals: options.decimals!,
        })
        .then((result: any) => {
          return updateAllowanceWhenTxSuccess(result.hash);
        });
    },
    [
      account,
      options.srcChainId,
      options.srcToken,
      allowance,
      options.address,
      options.decimals,
      vaultAddress,
      updateAllowanceWhenTxSuccess,
      checkIfChainTokenNeedRestApprove,
      resetApprove,
    ],
  );

  // only support orderly deposit
  const deposit = useCallback(async () => {
    await enquireAllowance();

    const inputs: Parameters<typeof account.assetsManager.deposit>[0] = {
      amount: quantity,
      fee: depositFee,
      decimals: options.decimals!,
      token: options.srcToken,
      vaultAddress,
    };

    const depositPromise = isNativeToken
      ? account.assetsManager.depositNativeToken(inputs)
      : account.assetsManager.deposit(inputs);

    return depositPromise
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
    options.srcToken,
    enquireAllowance,
    updateAllowanceWhenTxSuccess,
    isNativeToken,
    vaultAddress,
  ]);

  // TODO: loopGetBalance and queryBalance should be merged, both of them are used to get balance
  // get balance every 3s or 10s depends on chain namespace
  const loopGetBalance = async (timeout?: number) => {
    if (getBalanceListener.current) {
      clearTimeout(getBalanceListener.current);
    }

    const time =
      timeout ??
      (account.walletAdapter?.chainNamespace === ChainNamespace.solana
        ? 10000
        : 3000);

    if (balanceRef.current === "") {
      // when balance is empty, set loading to true
      setBalanceRevalidating(true);
    }

    getBalanceListener.current = setTimeout(async () => {
      try {
        const balance = await fetchBalanceHandler(
          options.address!,
          options.decimals,
        );
        console.log("balance", balance);
        setBalance(balance);
        balanceRef.current = balance;
        loopGetBalance();
      } catch (err: any) {
        console.log("get balance error", balanceRef.current, err);
        // when fetch balance failed, retry every 1s
        loopGetBalance(1000);
      } finally {
        if (balanceRef.current !== "") {
          setBalanceRevalidating(false);
        }
      }
    }, time);
  };

  const getDepositFee = useCallback(
    async (quantity: string) => {
      return account.assetsManager.getDepositFee({
        amount: quantity,
        chain: targetChain?.network_infos!,
        decimals: options.decimals!,
        token: options.srcToken,
        address: options.address,
      });
    },
    [account, targetChain, options.decimals, options.srcToken, options.address],
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

    loopGetBalance(0);

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

// when solana account not USDC, get balance will throw TokenAccountNotFoundError
function ignoreBalanceError(options: {
  token: string;
  chainNamespace: string;
  err: any;
}) {
  const { token, chainNamespace, err } = options;
  return (
    chainNamespace === ChainNamespace.solana &&
    token === "USDC" &&
    err?.name === "TokenAccountNotFoundError"
  );
}
