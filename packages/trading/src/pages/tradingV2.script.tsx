import { useTradingPageContext } from "../provider/context";
import { TradingPageV2Props } from "../types/types";

export const useTradingV2Script = () => {
    const props = useTradingPageContext();
    return props;
};

export type TradingV2State = ReturnType<typeof useTradingV2Script>;
