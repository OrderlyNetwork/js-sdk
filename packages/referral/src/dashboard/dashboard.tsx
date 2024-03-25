import { useContext } from "react";
import { ReferralContext } from "../hooks/referralContext";
import { Referral } from "../referral";
import { DashboardTab } from "./dashboardTab";

export const Dashboard = () => {

    const { isAffiliate, isTrader } = useContext(ReferralContext);

    console.log("xxxxxxxx isAffiliate", isAffiliate, isTrader);
    
    if (isAffiliate || isTrader) {
        return (
            <DashboardTab />
        );
    }
    return <Referral />;

}