import { TabPane, Tabs } from "@orderly.network/react";
import { useContext, useState } from "react";
import { ReferralContext } from "../hooks/referralContext";
import { ReferralIcon } from "./icons/referral";
import { Affiliate } from "../affiliate";
import { TraderIcon } from "./icons/trader";
import { Trader } from "../trader";

export type ReferralTabType = "affiliateTab" | "traderTab";

export const ReferralTab = () => {

    const { isAffiliate: isAffilate, isTrader } = useContext(ReferralContext);

    const [activeTab, setActiveTab] = useState<ReferralTabType>(isAffilate ? "affiliateTab" : "traderTab")
    const onTabChange = (tab: any) => {
        setActiveTab(tab);
    }

    return (
        <div>
            <Tabs
                key={"referralTab"}
                autoFit
                value={activeTab}
                tabBarClassName="orderly-justify-center orderly-h-[63px]"
                onTabChange={onTabChange}
            >
                <TabPane
                    value="affiliateTab"
                    title={(
                        <div className="orderly-flex orderly-items-center orderly-px-2">
                            <ReferralIcon />
                            Affilate
                        </div>
                    )}>
                    <Affiliate />
                </TabPane>

                <TabPane
                    value="traderTab"
                    title={(
                        <div className="orderly-flex orderly-items-center orderly-px-2">
                            <TraderIcon />
                            Trader
                        </div>
                    )}
                >
                    <Trader />
                </TabPane>
            </Tabs>
        </div>
    );
}