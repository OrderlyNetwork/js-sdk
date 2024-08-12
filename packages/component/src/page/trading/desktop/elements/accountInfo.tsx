import { AccountInfo } from "@/block/accountStatus/desktop";
import { memo } from "react";
import { useTradingPageContext } from "../../context/tradingPageContext";
import { TradingFeatures } from "../../features";
import { Divider } from "@/divider";
import SwitchMarginModulePlace from "@/page/trading/desktop/elements/switchMarginModulePlace";

export const AccountInfoElement = memo(() => {
  const { disableFeatures } = useTradingPageContext();
  if (disableFeatures?.includes(TradingFeatures.AssetAndMarginInfo))
    return null;
  return (
    <>
      <div className="orderly-px-4 orderly-relative">
        <SwitchMarginModulePlace />

        <AccountInfo />
      </div>
    </>
  );
});
