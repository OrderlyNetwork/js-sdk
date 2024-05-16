import { useContext } from "react";
import { ReferralContext } from "../hooks/referralContext";
import { Referral } from "../referral";
import { DashboardTab } from "./dashboardTab";
import { Loader } from "../components/loader";

export const Dashboard = () => {
  const { isAffiliate, isTrader, splashPage, isLoading } =
    useContext(ReferralContext);

  if (isLoading) {
    return (
      splashPage?.() || (
        <div id="orderly-referral-dashboard-loader" className="orderly-w-full orderly-h-full orderly-items-center orderly-justify-center orderly-flex">
          <Loader className="orderly-w-[40px] orderly-h-[40px]" />
        </div>
      )
    );
  }

  if (isAffiliate || isTrader) {
    return (
      <div className="orderly-referral-tab">
        <DashboardTab />
      </div>
    );
  }
  return <Referral />;
};
