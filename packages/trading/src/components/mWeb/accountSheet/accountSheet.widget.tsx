import { ReferralPropsV2, TradingRewardsProps } from "../../../types/types";
import { useAccountSheetScript } from "./accountSheet.script";
import { AccountSheet } from "./accountSheet.ui";

export const AccountSheetWidget = (props: ReferralPropsV2 & TradingRewardsProps) => {
    const state = useAccountSheetScript(props);
    return (<AccountSheet {...state} />);
};
