import { useTopTabScript } from "./topTab.script";
import { TopTab } from "./topTab.ui";

export const TopTabWidget = () => {
    const state = useTopTabScript();
    return (<TopTab {...state} />);
};
