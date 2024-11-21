import { useOrderBookAndEntryScript } from "./orderBookAndEntry.script";
import { OrderBookAndEntry } from "./orderBookAndEntry.ui";

export const OrderBookAndEntryWidget = (props: {
    className?: string;
}) => {
    const state = useOrderBookAndEntryScript();
    return (<OrderBookAndEntry className={props.className} {...state} />);
};
