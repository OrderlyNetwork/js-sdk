import { useContext } from "react";
import { ReferralContext } from "../hooks/referralContext";
import { Referral } from "../referral";
import { DashboardTab } from "./referralTab";

export const Dashboard = () => {

    const { isAffiliate, isTrader } = useContext(ReferralContext);


    if (isAffiliate === true || isTrader === true) {
        return (
            <DashboardTab />
        );
    }
    return <Referral />;

}