import { TradingPageV2Props } from "../types/types";
import { useTradingV2Script } from "./tradingV2.script";
import { TradingV2 } from "./tradingV2.ui";

export const TradingV2Widget = (props: TradingPageV2Props) => {
    const state = useTradingV2Script(props);
    return (<TradingV2 {...state} />);
};
