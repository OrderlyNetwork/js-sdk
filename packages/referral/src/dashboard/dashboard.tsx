import { useContext } from "react";
import { ReferralContext } from "../hooks/referralContext";
import { Referral } from "../referral";
import { DashboardTab } from "./dashboardTab";

export const Dashboard = () => {

    const { isAffiliate, isTrader } = useContext(ReferralContext);

    
    
    if (isAffiliate || isTrader) {
        return (
            <div className="orderly-referral-tab">
                <DashboardTab />
            </div>
        );
    }
    return <Referral />;

}