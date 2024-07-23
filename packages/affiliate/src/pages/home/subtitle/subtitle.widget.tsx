import { useSubtitleScript } from "./subtitle.script";
import { SubtitleUI } from "./subtitle.ui";

export const SubtitleWidget = () => {
    const state = useSubtitleScript();
    return (
        <SubtitleUI {...state}/>
    );
};
