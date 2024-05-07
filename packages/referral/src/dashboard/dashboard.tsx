import { useContext } from "react";
import { ReferralContext } from "../hooks/referralContext";
import { Referral } from "../referral";
import { DashboardTab } from "./dashboardTab";
import { Loader } from "../components/loader";

export const Dashboard = () => {

    const { isAffiliate, isTrader, splashPage, isLoading } = useContext(ReferralContext);

    
    if (isLoading && typeof splashPage !== 'undefined') {
        return <div id="orderly-refferral-dashboard-loader" className="orderly-bg-base-900 orderly-flex orderly-items-center">
            <Loader />
        </div>
        //  return splashPage?.();
    }
    
    if (isAffiliate || isTrader) {
        return (
            <div className="orderly-referral-tab">
                <DashboardTab />
            </div>
        );
    }
    return <Referral />;

}