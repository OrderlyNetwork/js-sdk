import { useScreen } from "@orderly.network/ui";
import { MobileMarketsDataList } from "./marketsDataList.mobile.ui";
import { useMarketsDataListScript } from "./marketsDataList.script";
import { MarketsDataList } from "./marketsDataList.ui";

export const MarketsDataListWidget = () => {
  const { isMobile } = useScreen();

  const state = useMarketsDataListScript();

  return isMobile ? (
    <MobileMarketsDataList {...state} />
  ) : (
    <MarketsDataList {...state} />
  );
};
