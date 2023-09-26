import { useCallback, useEffect, useState } from "react";
import { useAccount } from "../useAccount";
import { AccountStatusEnum } from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";

export const useDeposit = () => {
  const [balance, setBalance] = useState("0");
  const [allowance, setAllowance] = useState("0");

  const { account, state } = useAccount();
  //   const {} =

  const fetchBalance = useCallback(async () => {
    const balance = await account.assetsManager.getBalance(
      account.stateValue.address!
    );

    console.log("----- refresh balance -----", balance);
    setBalance(() => balance);
  }, [state]);

  const fetchAllowance = useCallback(async () => {
    const allowance = await account.assetsManager.getAllowance();

    console.log("----- refresh allowance -----", allowance);
    setAllowance(() => allowance);
  }, []);

  useEffect(() => {
    if (state.status < AccountStatusEnum.EnableTrading) return;

    fetchBalance();

    fetchAllowance();
  }, [state]);

  const approve = useCallback(
    (amount: string) => {
      return account.assetsManager.approve(amount).then((result: any) => {
        return fetchAllowance().then(() => result);
      });
    },
    [account]
  );

  const deposit = useCallback(
    (amount: string) => {
      return account.assetsManager.deposit(amount).then((res: any) => {
        setBalance((prev) => {
          return new Decimal(prev).sub(amount).toString();
        });
        return fetchAllowance().then(() => res);
        // return res;
      });
    },
    [account, fetchBalance]
  );

  return {
    balance,
    allowance,
    approve,
    deposit,
  };
};
