import { useMediaQuery } from "@orderly.network/hooks";
import { useTradingPateContext } from "../provider/context";
import { TradingPageV2Props } from "../types/types";
import { MEDIA_TABLET } from "@orderly.network/types";

export const useTradingV2Script = () => {
    const props = useTradingPateContext();
    return {
        ...props,
        isMobileLayout,
    };
};

export type TradingV2State = ReturnType<typeof useTradingV2Script>;
