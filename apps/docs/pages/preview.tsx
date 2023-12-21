import { useThemeUpdate } from "@/components/theming/useThemeUpdate";
import { TradingPage } from "@orderly.network/react";
import { useEffect, useRef } from "react";

export default function Page() {
  return <TradingPage symbol={"PERP_ETH_USDC"} tradingViewConfig={undefined} />;
}
