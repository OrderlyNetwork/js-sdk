import { useState } from "react";

export type WithdrawInputs = {
  amoutn: number;
  address: string;
};

export const useWithdraw = () => {
  const [state, setState] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  const withdraw = (amount: number): Promise<any> => {
    return Promise.resolve();
  };

  return { state, withdraw, isLoading };
};
