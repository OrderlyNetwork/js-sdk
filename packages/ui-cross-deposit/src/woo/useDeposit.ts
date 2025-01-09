import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useAccount,
  useChains,
  useConfig,
  useDebouncedCallback,
  useEventEmitter
} from "@orderly.network/hooks";
import {
  API,
  ARBITRUM_MAINNET_CHAINID,
  ARBITRUM_TESTNET_CHAINID,
  AccountStatusEnum,
  DEPOSIT_FEE_RATE,
  NetworkId,
    EnumTrackerKeys
} from "@orderly.network/types";
import { Decimal, isTestnet } from "@orderly.network/utils";
import { isNativeTokenChecker } from "../woo/constants";

export type useDepositOptions = {
  // from address
  address?: string;
  decimals?: number;
  // vaultAddress?: string;
  crossChainRouteAddress?: string;
  depositorAddress?: string;
  networkId?: NetworkId;
  srcChainId?: number;
  srcToken?: string;
  quantity?: string;
};

export const useDeposit = (options?: useDepositOptions) => {
  const networkId = useConfig("networkId");
  const [balanceRevalidating, setBalanceRevalidating] = useState(false);
  const [allowanceRevalidating, setAllowanceRevalidating] = useState(false);
  const ee = useEventEmitter()

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
    // if (!address || !vaultAddress) return;
    const key = `${address}-${vaultAddress}`;

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
    return allowance;
  };

  const getVaultAddress = useCallback((): string | undefined => {
    if (dst.chainId !== options?.srcChainId) {
      return options?.crossChainRouteAddress;
    } else {
      if (dst.symbol !== options?.srcToken) {
        return options?.depositorAddress;
      }
    }
  }, [options, dst]);

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

    const commonParams = {
      address: options?.address,
      decimals: options?.decimals,
    };

    if (dst.chainId !== options?.srcChainId) {
      queryAllowance({
        ...commonParams,
        vaultAddress: options?.crossChainRouteAddress,
      });
    } else {
      if (dst.symbol !== options?.srcToken) {
        queryAllowance({
          ...commonParams,
          vaultAddress: options?.depositorAddress,
        });
      } else {
        getAllowanceByDefaultAddress(commonParams);
      }
    }
  }, [
    state.status,
    options?.address,
    options?.crossChainRouteAddress,
    options?.depositorAddress,
    options?.srcChainId,
    options?.srcToken,
    options?.decimals,
    account.address,
    dst.chainId,
    dst.symbol,
  ]);

  const updateAllowanceWhenTxSuccess = useCallback(
    (txHash: string) => {
      const vaultAddress = getVaultAddress();
      return account.walletAdapter
        ?.pollTransactionReceiptWithBackoff(txHash)
        .then((receipt) => {
          if (receipt.status === 1) {
            account.assetsManager
              .getAllowance({
                address: options?.address,
                vaultAddress,
                decimals: options?.decimals,
              })
              .then((allowance) => {
                setAllowance(() => allowance);
              });
          }
        });
    },
    [account, getVaultAddress, options?.address, options?.decimals]
  );

  // TODO: get allowance for cross chain
  const enquireAllowance = useCallback(async () => {
    if (!options?.address) {
      throw new Error("address is required");
    }

    const vaultAddress = getVaultAddress();
    const _allowance = await account.assetsManager.getAllowance({
      address: options?.address,
      vaultAddress,
      decimals: options?.decimals,
    });

    // const commonParams = {
    //   address: options?.address,
    //   decimals: options?.decimals,
    // };

    // let _allowance: string | undefined;

    // if (dst.chainId !== options?.srcChainId) {
    //   _allowance = await getAllowance({
    //     ...commonParams,
    //     vaultAddress: options?.crossChainRouteAddress,
    //   });
    // } else {
    //   if (dst.symbol !== options?.srcToken) {
    //     _allowance = await getAllowance({
    //       ...commonParams,
    //       vaultAddress: options?.depositorAddress,
    //     });
    //   } else {
    //     _allowance = await getAllowanceByDefaultAddress(commonParams);
    //   }
    // }

    setAllowance(() => _allowance);

    // console.log("enquireAllowance", _allowance);

    if (new Decimal(quantity).greaterThan(_allowance)) {
      throw new Error("Insufficient allowance");
    }

    return _allowance;
  }, [
    account,
    getVaultAddress,
    options?.address,
    options?.decimals,
    // dst.symbol,
    // dst.chainId,
    // options?.srcChainId,
    // options?.srcToken,
    // options?.crossChainRouteAddress,
    // options?.depositorAddress,
  ]);

  const approve = useCallback(
    async (amount?: string) => {
      if (!options?.address) {
        throw new Error("address is required");
      }
      const vaultAddress = getVaultAddress();

      return account.assetsManager
        .approve({
          address: options.address,
          amount,
          vaultAddress,
          decimals: options?.decimals,
        })
        .then((result: any) => {
          return updateAllowanceWhenTxSuccess(result.hash);
        });
    },
    [
      account,
      getVaultAddress,
      updateAllowanceWhenTxSuccess,
      dst,
      options?.address,
      options?.decimals,
    ]
  );

  // only support orderly deposit
  const deposit = useCallback(async () => {
    await enquireAllowance();
    return account.assetsManager
      .deposit(quantity, depositFee)
      .then((result: any) => {
        updateAllowanceWhenTxSuccess(result.hash);
        setBalance((value) => new Decimal(value).sub(quantity).toString());
        ee.emit(EnumTrackerKeys.DEPOSIT_SUCCESS, {
            wallet:state?.connectWallet?.name,
            network:targetChain?.network_infos.name,
            quantity,
          });
        return result;
      }).catch((e => {
        ee.emit(EnumTrackerKeys.DEPOSIT_FAILED, {
            wallet:state?.connectWallet?.name,
            network:targetChain?.network_infos?.name,
            msg: JSON.stringify(e),
        });
        throw e
      }));
  }, [
    state,
    account,
    quantity,
    depositFee,
    targetChain,
    fetchBalance,
    getVaultAddress,
    updateAllowanceWhenTxSuccess,
  ]);

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
