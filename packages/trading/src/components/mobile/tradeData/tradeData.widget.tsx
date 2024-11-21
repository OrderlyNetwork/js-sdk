import { useTradeDataScript } from "./tradeData.script";
import { TradeData } from "./tradeData.ui";

export const TradeDataWidget = (props: {
    symbol: string;
}) => {
    const state = useTradeDataScript(props);
    return (<TradeData {...state} />);
};
