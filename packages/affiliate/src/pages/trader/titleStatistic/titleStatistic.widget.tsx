import { useTitleStatisticScript } from "./titleStatistic.script";
import { TitleStatisticUI } from "./titleStatistic.ui";

export const TitleStatisticWidget = () => {
    const state = useTitleStatisticScript();
    return (
        <TitleStatisticUI {...state}/>
    );
};
