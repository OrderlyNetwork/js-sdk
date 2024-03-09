import { BarChart } from "./sections/barChart";
import { CommissionAndReferees } from "./sections/commissionAndReferees";
import { ReferralCode } from "./sections/referralCode";
import { ReferralLink } from "./sections/referralLink";
import { Summary } from "./sections/summary";

export const Affiliate = () => {


    return (<div className="orderly-bg-base-900">
            <Summary />
            <ReferralLink />
            <ReferralCode />
            <BarChart />
            <CommissionAndReferees />
        </div>);
}