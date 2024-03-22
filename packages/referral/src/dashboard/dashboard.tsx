import { useContext } from "react";
import { ReferralContext } from "../hooks/referralContext";
import { Referral } from "../referral";
import { DashboardTab } from "./referralTab";

export const Dashboard = () => {

    const { isAffiliate, isTrader } = useContext(ReferralContext);

    

    if (isAffiliate === undefined && isTrader === undefined) {
        return <div className="orderly-flex-col orderly-items-center orderly-justify-center">
            loading...
        </div>
    }

    if (!isAffiliate && !isTrader) {
        return <Referral />
    }

    return (
        <DashboardTab />
    );
}