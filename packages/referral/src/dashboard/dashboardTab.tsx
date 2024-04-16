import { Button, TabPane, Tabs, cn, modal } from "@orderly.network/react";
import { useContext, useEffect, useMemo, useState } from "react";
import { ReferralContext } from "../hooks/referralContext";
import { ReferralIcon } from "./icons/referral";
import { Affiliate } from "../affiliate";
import { TraderIcon } from "./icons/trader";
import { Trader } from "../trader";

export type DashboardTabType = "affiliateTab" | "traderTab";

export const DashboardTab = () => {

    const {
        isAffiliate,
        isTrader,
        showReferralPage,
    } = useContext(ReferralContext);


    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('tab');
        if (code && code === '0') {
            setActiveTab("affiliateTab");
        } else if (code && code === '1') {
            setActiveTab("traderTab");
        }
    }, []);



    const [activeTab, setActiveTab] = useState<DashboardTabType>(isAffiliate ? "affiliateTab" : "traderTab")
    const onTabChange = (tab: any) => {
        setActiveTab(tab);
    }


    const onAsAnTrader = () => {
        showReferralPage?.();
    };

    const onAsAnAffiliate = () => {
        showReferralPage?.();
    }

    const tabBarExtra = useMemo(() => {
        if (isAffiliate === true && isTrader === false) {
            return <Button
                id="orderly-referral-dashboard-as-trader-btn"
                onClick={onAsAnTrader}
                className="orderly-flex orderly-bg-[rgba(0,104,92,1)] lg:orderly-mr-4"
            >
                <TraderIcon />
                <div>As trader</div>
            </Button>;
        }

        if (isTrader === true && isAffiliate === false) {
            return <Button onClick={onAsAnAffiliate} className="orderly-flex lg:orderly-mr-4">
                <ReferralIcon />
                <div>As Referrer</div>
            </Button>;
        }

        return undefined;
    }, [isAffiliate, isTrader]);


    const affiliatePane = useMemo(() => {
        return (
            <TabPane
                value="affiliateTab"
                title={(
                    <div className="orderly-flex orderly-items-center orderly-px-2 orderly-gap-2">
                        <ReferralIcon fillOpacity={1.0} className={cn("orderly-fill-white/20", activeTab === "affiliateTab" && "orderly-fill-base-contrast")} />
                        Affiliate
                    </div>
                )}>
                <div className="orderly-mt-0"><Affiliate /></div>
            </TabPane>
        );
    }, [activeTab]);

    const traderPane = useMemo(() => {
        return (
            <TabPane
                value="traderTab"
                title={(
                    <div className="orderly-flex orderly-items-center orderly-px-2 orderly-gap-2">
                        <TraderIcon fillOpacity={1.0} className={cn("orderly-fill-white/20", activeTab === "traderTab" && "orderly-fill-base-contrast")} />
                        Trader
                    </div>
                )}
            >
                <div className="orderly-mt-0"><Trader /></div>
            </TabPane>
        );
    }, [activeTab]);


    if (isAffiliate && isTrader == false) {
        return (
            <Tabs key={"referralTab-affiliate"}
                autoFit
                value={activeTab}
                tabBarClassName={cn(
                    "orderly-justify-center lg:orderly-justify-center orderly-h-[60px] orderly-referral-tab-bar",
                    (!isAffiliate || !isTrader) && "orderly-justify-start"
                )}
                onTabChange={onTabChange}
                tabBarExtra={tabBarExtra}
                identifierClassName={"after:orderly-bg-gradient-to-l after:orderly-from-referral-text-from after:orderly-to-referral-text-to"}
            >
                {affiliatePane}
            </Tabs>
        );
    }

    else if (isTrader && isAffiliate == false) {
        return (
            <Tabs key={"referralTab-trader"}
                autoFit
                value={activeTab}
                tabBarClassName={cn(
                    "orderly-justify-center lg:orderly-justify-center orderly-h-[60px] orderly-referral-tab-bar",
                    (!isAffiliate || !isTrader) && "orderly-justify-start"
                )}
                onTabChange={onTabChange}
                tabBarExtra={tabBarExtra}
                identifierClassName={"after:orderly-bg-gradient-to-l after:orderly-from-referral-text-from after:orderly-to-referral-text-to"}
            >
                {traderPane}
            </Tabs>
        );
    } else {
        return (
            <Tabs key={"referralTab-trader"}
                autoFit
                value={activeTab}
                tabBarClassName={cn(
                    "orderly-justify-center lg:orderly-justify-center orderly-h-[60px] orderly-referral-tab-bar",
                    (!isAffiliate || !isTrader) && "orderly-justify-start"
                )}
                onTabChange={onTabChange}
                tabBarExtra={tabBarExtra}
                identifierClassName={"after:orderly-bg-gradient-to-l after:orderly-from-referral-text-from after:orderly-to-referral-text-to"}
            >
                {affiliatePane}
                {traderPane}
            </Tabs>
        );
    };
}