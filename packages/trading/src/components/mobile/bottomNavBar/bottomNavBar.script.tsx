import { modal } from "@orderly.network/ui";
import { AccountSheetWidget } from "../accountSheet";
import { useTradingPageContext } from "../../../provider/context";
import { PortfolioSheetWidget } from "../portfolioSheet";
import { useTradingLocalStorage } from "../../../provider/useTradingLocalStorage";
import { useAccount } from "@orderly.network/hooks";
import { isTestnet } from "@orderly.network/utils";
import { useMemo } from "react";
import { useAppContext } from "@orderly.network/react-app";

export const useBottomNavBarScript = () => {
  

  const { wrongNetwork } = useAppContext();
  return {
    wrongNetwork,
  };
};

export type BottomNavBarState = ReturnType<typeof useBottomNavBarScript>;
