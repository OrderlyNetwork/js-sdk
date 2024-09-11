import { useMarginRatioScript } from "./marginRatio.script";
import { MarginRatio } from "./marginRatio.ui";

export const MarginRatioWidget = () => {
    const state = useMarginRatioScript();
    return (<MarginRatio {...state} />);
};
