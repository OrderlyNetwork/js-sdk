import { useAccount } from "../useAccount";
import { useMaxWithdrawal } from "./useMaxWithdrawal";

interface UseWithdrawOptions {
  token?: string;
}

export const useConvert = (options: UseWithdrawOptions) => {
  const { token = "" } = options;

  const { account } = useAccount();
  const maxAmount = useMaxWithdrawal(token);

  const convert = async (inputs: { amount: number; slippage: number }) => {
    return account.assetsManager.convert({
      ...inputs,
      converted_asset: token,
    });
  };

  return { maxAmount, convert };
};
