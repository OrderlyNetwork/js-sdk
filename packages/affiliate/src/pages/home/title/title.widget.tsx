import { useTitleScript } from "./title.script";
import { TitleUI } from "./title.ui";

export const TitleWidget = () => {
    const state = useTitleScript();
    return (
        <TitleUI {...state}/>
    );
};