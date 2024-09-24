import { LastTradesWidget } from "../../base/lastTrades";

export const MWebLastTrades = (props: {
    symbol: string;
}) => {

    return <LastTradesWidget symbol={props.symbol} classNames={
        {
            root: "oui-px-3 oui-min-h-[173px] oui-max-h-[234px]",
            listHeader: "oui-text-xs oui-text-base-contrast-36",
            listItem: {
                left: "oui-text-xs",
                mid: "oui-text-xs",
                right: "oui-text-xs",
            }
        }
    }/>;
};