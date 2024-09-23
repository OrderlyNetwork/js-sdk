import { useRiskRateScript } from "./riskRate.script";
import { RiskRate } from "./riskRate.ui";

export const RiskRateWidget = () => {
    const state = useRiskRateScript();
    return (<RiskRate {...state} />);
};
