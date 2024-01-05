import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAccount } from "../useAccount";
import {
  API,
  ARBITRUM_MAINNET_CHAINID,
  ARBITRUM_TESTNET_CHAINID,
  AccountStatusEnum,
  NetworkId,
} from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";
import { isNativeTokenChecker } from "../woo/constants";
import { useChains } from "./useChains";
import { OrderlyContext } from "../orderlyContext";
import { useConfig } from "../useConfig";

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

  /**
   * @hidden
   */
  wooSwapEnabled?: boolean;
};

export const useDeposit = (options?: useDepositOptions) => {
  const { enableSwapDeposit } = useContext<any>(OrderlyContext);

  const networkId = useConfig("networkId");
  const [balanceRevalidating, setBalanceRevalidating] = useState(false);
  const [allowanceRevalidating, setAllowanceRevalidating] = useState(false);

  const [_, { findByChainId }] = useChains(undefined, {
    wooSwapEnabled: enableSwapDeposit,
  });

  const [balance, setBalance] = useState("0");
  const [allowance, setAllowance] = useState("0");

  const { account, state } = useAccount();

  const prevAddress = useRef<string | undefined>();
  const getBalanceListener = useRef<ReturnType<typeof setTimeout>>();

  const dst = useMemo(() => {
    const chain: API.Chain | undefined =
      networkId === "testnet"
        ? (findByChainId(ARBITRUM_TESTNET_CHAINID) as API.Chain | undefined)
        : (findByChainId(ARBITRUM_MAINNET_CHAINID) as API.Chain | undefined);

    const USDC = chain?.token_infos.find(
      (token: API.TokenInfo) => token.symbol === "USDC"
    );
    if (!chain) {
      throw new Error("dst chain not found");
    }
    return {
      symbol: "USDC",
      address: USDC?.address,
      decimals: USDC?.decimals,
      chainId: chain.network_infos.chain_id,
      network: chain.network_infos.shortName,
      // chainId: 42161,
    };
  }, [networkId, findByChainId]);

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
    async (address?: string, decimals?: number) => {
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

  const getVaultAddress = useCallback((): string | undefined => {
    if (dst.chainId !== options?.srcChainId) {
      return options?.crossChainRouteAddress;
    } else {
      if (dst.symbol !== options?.srcToken) {
        return options?.depositorAddress;
      }
    }
  }, [options, dst]);

  useEffect(() => {
    if (state.status < AccountStatusEnum.Connected) return;
    setBalanceRevalidating(true);
    fetchBalance(options?.address, options?.decimals).finally(() => {
      setBalanceRevalidating(false);
    });

    if (dst.chainId !== options?.srcChainId) {
      getAllowance(options?.address, options?.crossChainRouteAddress);
    } else {
      if (dst.symbol !== options?.srcToken) {
        getAllowance(options?.address, options?.depositorAddress);
      } else {
        getAllowanceByDefaultAddress(options?.address);
      }
    }
  }, [
    state.status,
    options?.address,
    options?.crossChainRouteAddress,
    options?.depositorAddress,
    options?.srcChainId,
    options?.srcToken,
    account.address,
    dst.chainId,
    dst.symbol,
  ]);

  const approve = useCallback(
    (amount: string | undefined) => {
      if (!options?.address) {
        throw new Error("address is required");
      }
      const vaultAddress = getVaultAddress();
      return account.assetsManager
        .approve(options.address, amount, vaultAddress)
        .then((result: any) => {
          if (typeof amount !== "undefined") {
            setAllowance((value) => new Decimal(value).add(amount).toString());
          }
          return result;
        });
    },
    [account, getAllowance, options?.address]
  );

  const getDepositFee = useCallback(
    async (amount: string) => {
      return account.assetsManager.getDepositFee(amount);
    },
    [account]
  );

  const deposit = useCallback(
    (amount: string, fee?: bigint) => {
      // only support orderly deposit

      return account.assetsManager.deposit(amount, fee).then((res: any) => {
        setAllowance((value) => new Decimal(value).sub(amount).toString());
        setBalance((value) => new Decimal(value).sub(amount).toString());
        return res;
      });
    },
    [account, fetchBalance, getAllowance]
  );

  const loopGetBalance = async () => {
    getBalanceListener.current && clearTimeout(getBalanceListener.current);
    getBalanceListener.current = setTimeout(async () => {
      const balance = await fetchBalanceHandler(
        options?.address!,
        options?.decimals
      );

      setBalance(balance);
      loopGetBalance();
    }, 3000);
  };

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
    dst,
    balance,
    allowance,
    isNativeToken,
    balanceRevalidating,
    allowanceRevalidating,
    approve,
    deposit,
    getDepositFee,
    fetchBalances,
    fetchBalance: fetchBalanceHandler,
  };
};
