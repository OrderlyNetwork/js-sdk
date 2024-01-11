import { AccountInfo } from "@/block/accountStatus/desktop";
import { memo } from "react";
import { useTradingPageContext } from "../../context/tradingPageContext";
import { TradingFeatures } from "../../features";
import { Divider } from "@/divider";

export const AccountInfoElement = memo(() => {
  const { disableFeatures } = useTradingPageContext();
  if (disableFeatures.includes(TradingFeatures.AssetAndMarginInfo)) return null;
  return (
    <>
      <div className="orderly-px-3">
        <AccountInfo />
      </div>
      <Divider className="orderly-my-3" />
    </>
  );
});
