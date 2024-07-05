import { useSummaryScript } from "./summary.script";
import { SummaryUI } from "./summary.ui";

export const SummaryWidget = () => {
    const state = useSummaryScript();
    return (
        <SummaryUI {...state}/>
    );
};
