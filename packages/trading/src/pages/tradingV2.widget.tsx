import { TradingPageV2Props } from "../types/types";
import { useTradingV2Script } from "./tradingV2.script";
import { TradingV2 } from "./tradingV2.ui";

export const TradingV2Widget = () => {
    const state = useTradingV2Script();
    return (<TradingV2 {...state} />);
};
