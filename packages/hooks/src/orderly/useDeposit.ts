import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAccount } from "../useAccount";
import { API, AccountStatusEnum } from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";
import { nativeTokenAddress } from "../woo/constants";
// import { Decimal } from "@orderly.network/utils";

export type useDepositOptions = {
  // from address
  address?: string;
  decimals?: number;
  vaultAddress?: string;
};

const isNativeTokenChecker = (address: string) =>
  address === nativeTokenAddress;

export const useDeposit = (options?: useDepositOptions) => {
  // console.log("useDeposit options:", options);
  const [balanceRevalidating, setBalanceRevalidating] = useState(false);
  const [allowanceRevalidating, setAllowanceRevalidating] = useState(false);

  const [balance, setBalance] = useState("0");
  const [allowance, setAllowance] = useState("0");

  const { account, state } = useAccount();

  // const depositQueue = useRef<string[]>([]);

  const dst = useMemo(() => {
    return {
      symbol: "USDC",
      address: "",
      decimals: 6,
      // chainId: 421613,
      network: "Arbitrum Goerli",
      chainId: 42161,
    };
  }, []);

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
        balance = await account.assetsManager.getBalance(address);
      }

      return balance;
    },
    []
  );

  const fetchBalance = useCallback(
    async (address?: string) => {
      if (!address) return;
      // console.log("fetchBalance", address, !!address && isNativeToken(address));

      try {
        if (balanceRevalidating) return;
        setBalanceRevalidating(true);
        const balance = await fetchBalanceHandler(address);

        console.log("----- refresh balance -----", balance);
        setBalance(() => balance);
        setBalanceRevalidating(false);
      } catch (e) {
        console.warn("----- refresh balance error -----", e);
        setBalanceRevalidating(false);
        setBalance(() => "0");
      }
    },
    [state, balanceRevalidating]
  );

  const fetchBalances = useCallback(async (tokens: API.TokenInfo[]) => {
    const tasks = [];

    console.log("fetch balances ---->>>>", tokens);

    for (const token of tokens) {
      // native token skip
      if (isNativeTokenChecker(token.address)) {
        continue;
      }
      tasks.push(account.assetsManager.getBalanceByAddress(token.address));
    }

    const balances = await Promise.all(tasks);

    console.log("----- get balances from tokens -----", balances);

    // const balances = await account.assetsManager.getBalances(tokens);

    // // console.log("----- refresh balance -----", balance);
    // setBalance(() => balances);
  }, []);

  const getAllowance = useCallback(
    async (address?: string, vaultAddress?: string) => {
      console.log("getAllowance", address, vaultAddress);
      if (!address) return;
      if (address && isNativeTokenChecker(address)) return;
      if (allowanceRevalidating) return;
      setAllowanceRevalidating(true);

      const allowance = await account.assetsManager.getAllowance(
        address,
        vaultAddress
      );

      console.log("----- refresh allowance -----", allowance);
      setAllowance(() => allowance);
      setAllowanceRevalidating(false);
      return allowance;
    },
    [allowanceRevalidating]
  );

  useEffect(() => {
    console.log("useDeposit useEffect", state.status, options?.address);

    if (state.status < AccountStatusEnum.EnableTrading) return;

    fetchBalance(options?.address);

    getAllowance(options?.address, options?.vaultAddress);
  }, [state.status, options?.address, options?.vaultAddress]);

  const approve = useCallback(
    (amount: string | undefined) => {
      if (!options?.address) {
        throw new Error("address is required");
      }
      return account.assetsManager
        .approve(options.address, amount, options?.vaultAddress)
        .then((result: any) => {
          if (typeof amount !== "undefined") {
            setAllowance((value) => new Decimal(value).add(amount).toString());
          }
          return result;
        });
    },
    [account, getAllowance, options?.address, options?.vaultAddress]
  );

  const deposit = useCallback(
    (amount: string) => {
      // only support orderly deposit
      return account.assetsManager.deposit(amount).then((res: any) => {
        // console.log("----- deposit -----", res);

        setAllowance((value) => new Decimal(value).sub(amount).toString());
        setBalance((value) => new Decimal(value).sub(amount).toString());
        return res;
      });
    },
    [account, fetchBalance, getAllowance]
  );

  return {
    dst,
    balance,
    allowance,
    isNativeToken,
    balanceRevalidating,
    allowanceRevalidating,
    approve,
    deposit,
    fetchBalances,
    fetchBalance: fetchBalanceHandler,
  };
};
