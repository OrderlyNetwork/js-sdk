import { useTopTabScript } from "./topTab.script";
import { TopTab } from "./topTab.ui";

export const TopTabWidget = (props: {
    className?: string
}) => {
    const state = useTopTabScript();
    return (<TopTab className={props.className} {...state} />);
};
