import { useAsATraderScript } from "./asATrader.script";
import { AsATraderUI } from "./asATrader.ui";

export const AsATraderWidget = () => {
    const state = useAsATraderScript();
    return (
        <AsATraderUI {...state}/>
    );
};
