import { AccountInfo } from "@/block/accountStatus/desktop";
import { memo } from "react";
import { useTradingPageContext } from "../../context/tradingPageContext";
import { TradingFeatures } from "../../features";

export const AccountInfoElement = memo(() => {
  const { disableFeatures } = useTradingPageContext();
  if (disableFeatures.includes(TradingFeatures.AssetAndMarginInfo)) return null;
  return (
    <div className="orderly-px-3">
      <AccountInfo />
    </div>
  );
});
