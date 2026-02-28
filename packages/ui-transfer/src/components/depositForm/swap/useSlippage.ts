import { useLocalStorage } from "@orderly.network/hooks";

const ORDERLY_SWAP_DEPOSIT_SLIPPAGE_KEY = "orderly_swap_deposit_slippage";

export const useSlippage = () => {
  const [slippage, setSlippage] = useLocalStorage(
    ORDERLY_SWAP_DEPOSIT_SLIPPAGE_KEY,
    1,
  );

  return { slippage, onSlippageChange: setSlippage };
};
