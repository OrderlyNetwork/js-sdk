import { TradingPageProvider } from "../provider";
import { TradingPageV2Props } from "../types/types";
import { TradingV2Widget } from "./tradingV2.widget";

export const TradingPageV2 = (props: TradingPageV2Props) => {
  return (
    <TradingPageProvider
      symbol={props.symbol}
      tradingViewConfig={props.tradingViewConfig}
      onSymbolChange={props.onSymbolChange}
      disableFeatures={props.disableFeatures}
      overrideFeatures={props.overrideFeatures}
      dataList={props.dataList}
      referral={props.referral}
      tradingRewards={props.tradingRewards}
      bottomSheetLeading={props.bottomSheetLeading}
    >
      <TradingV2Widget />
    </TradingPageProvider>
  );
};
