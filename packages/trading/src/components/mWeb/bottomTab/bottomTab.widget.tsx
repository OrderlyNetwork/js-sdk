import { useBottomTabScript } from "./bottomTab.script";
import { BottomTab } from "./bottomTab.ui";

export const BottomTabWidget = (props: {
    className?: string;
}) => {
    const state = useBottomTabScript();
    return (<BottomTab className={props.className} {...state} />);
};
