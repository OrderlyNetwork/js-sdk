import { useTabScript } from "./tab.script";
import { TabUI } from "./tab.ui";

export const TabWidget = () => {
    const state = useTabScript();
    return (
        <TabUI {...state}/>
    );
};
