import { useTopScript } from "./top.script";
import { TopUI } from "./top.ui";

export const TopWidget = () => {
    const state = useTopScript();
    return (
        <TopUI {...state}/>
    );
};
