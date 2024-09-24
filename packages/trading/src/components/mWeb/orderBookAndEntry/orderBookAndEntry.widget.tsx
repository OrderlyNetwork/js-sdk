import { useOrderBookAndEntryScript } from "./orderBookAndEntry.script";
import { OrderBookAndEntry } from "./orderBookAndEntry.ui";

export const OrderBookAndEntryWidget = () => {
    const state = useOrderBookAndEntryScript();
    return (<OrderBookAndEntry {...state} />);
};
