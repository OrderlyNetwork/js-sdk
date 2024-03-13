import { useContext } from "react";
import { ReferralProvider } from "../hooks";
import { ReferralContext } from "../hooks/referralContext";
import { Dashboard } from "../dashboard";
import { ReferralTab } from "./referralTab";

export const Referral = () => {

    const { isAffilate, isTrader } = useContext(ReferralContext);

    console.log("xxxxxxxxx ", isAffilate, isTrader);
    

    if (isAffilate === undefined && isTrader === undefined) {
        return <div className="orderly-flex-col orderly-items-center orderly-justify-center">
            loading...
        </div>
    }

    if (!isAffilate && !isTrader) {
        return <Dashboard />
    }

    return (
        <ReferralTab />
    );
}