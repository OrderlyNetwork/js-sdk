import { PositionsProps } from "@orderly.network/ui-positions";
import { useBottomTabScript } from "./bottomTab.script";
import { BottomTab } from "./bottomTab.ui";

export const BottomTabWidget = (props: {
    symbol: string;
    className?: string;
    config: Partial<Omit<PositionsProps, "pnlNotionalDecimalPrecision">>;
}) => {
    const state = useBottomTabScript({
        config: props.config,
        symbol: props.symbol,
    });
    return (<BottomTab className={props.className} {...state} />);
};
