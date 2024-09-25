import { useBottomTabScript } from "./bottomTab.script";
import { BottomTab } from "./bottomTab.ui";

export const BottomTabWidget = () => {
    const state = useBottomTabScript();
    return (<BottomTab {...state} />);
};
