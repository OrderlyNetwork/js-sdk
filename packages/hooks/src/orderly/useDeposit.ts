import { useCallback, useEffect, useRef, useState } from "react";
import { useAccount } from "../useAccount";
import { AccountStatusEnum } from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";
// import { Decimal } from "@orderly.network/utils";

export const useDeposit = () => {
  const [balance, setBalance] = useState("0");
  const [allowance, setAllowance] = useState("0");

  const { account, state } = useAccount();

  // const depositQueue = useRef<string[]>([]);

  const fetchBalance = useCallback(async () => {
    const balance = await account.assetsManager.getBalance();

    // console.log("----- refresh balance -----", balance);
    setBalance(() => balance);
  }, [state]);

  const fetchAllowance = useCallback(async () => {
    const allowance = await account.assetsManager.getAllowance();

    console.log("----- refresh allowance -----", allowance);
    setAllowance(() => allowance);
    return allowance;
  }, []);

  useEffect(() => {
    if (state.status < AccountStatusEnum.EnableTrading) return;

    fetchBalance();

    fetchAllowance();
  }, [state]);

  const approve = useCallback(
    (amount: string | undefined) => {
      return account.assetsManager.approve(amount).then((result: any) => {
        if (typeof amount !== "undefined") {
          setAllowance((value) => new Decimal(value).add(amount).toString());
        }
        return result;
      });
    },
    [account, fetchAllowance]
  );

  const deposit = useCallback(
    (amount: string) => {
      return account.assetsManager.deposit(amount).then((res: any) => {
        console.log("----- deposit -----", res);
        // depositQueue.current.push(res.hash);
        // return fetchAllowance().then(() => res);
        setAllowance((value) => new Decimal(value).sub(amount).toString());
        setBalance((value) => new Decimal(value).sub(amount).toString());
        return res;
      });
    },
    [account, fetchBalance, fetchAllowance]
  );

  return {
    balance,
    allowance,
    approve,
    deposit,
  };
};
