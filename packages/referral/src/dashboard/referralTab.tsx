import { Button, TabPane, Tabs, cn, modal } from "@orderly.network/react";
import { useContext, useMemo, useState } from "react";
import { ReferralContext } from "../hooks/referralContext";
import { ReferralIcon } from "./icons/referral";
import { Affiliate } from "../affiliate";
import { TraderIcon } from "./icons/trader";
import { Trader } from "../trader";

export type ReferralTabType = "affiliateTab" | "traderTab";

export const DashboardTab = () => {

    const {
        isAffiliate,
        isTrader,
        showReferralPage,
    } = useContext(ReferralContext);

    

    const [activeTab, setActiveTab] = useState<ReferralTabType>(isAffiliate ? "affiliateTab" : "traderTab")
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
            return <Button onClick={onAsAnTrader} className="orderly-flex orderly-bg-[rgba(0,104,92,1)] lg:orderly-mr-4">
                <TraderIcon />
                <div>As a trader</div>
            </Button>;
        }

        if (isTrader === true && isAffiliate === false) {
            return <Button onClick={onAsAnAffiliate} className="orderly-flex lg:orderly-mr-4">
                <ReferralIcon />
                <div>As a referral</div>
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
                        <ReferralIcon />
                        Affilate
                    </div>
                )}>
                <div className="orderly-mt-3"><Affiliate /></div>
            </TabPane>
        );
    }, []);

    const traderPane = useMemo(() => {
        return (
            <TabPane
                value="traderTab"
                title={(
                    <div className="orderly-flex orderly-items-center orderly-px-2 orderly-gap-2">
                        <TraderIcon />
                        Trader
                    </div>
                )}
            >
                <div className="orderly-mt-3"><Trader /></div>
            </TabPane>
        );
    }, []);


    if (isAffiliate && isTrader == false) {
        return (
            <Tabs key={"referralTab-affiliate"}
                autoFit
                value={activeTab}
                tabBarClassName={cn(
                    "orderly-justify-center lg:orderly-justify-center orderly-h-[63px]",
                    (!isAffiliate || !isTrader) && "orderly-justify-start"
                )}
                onTabChange={onTabChange}
                tabBarExtra={tabBarExtra}
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
                    "orderly-justify-center lg:orderly-justify-center orderly-h-[63px]",
                    (!isAffiliate || !isTrader) && "orderly-justify-start"
                )}
                onTabChange={onTabChange}
                tabBarExtra={tabBarExtra}
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
                    "orderly-justify-center lg:orderly-justify-center orderly-h-[63px]",
                    (!isAffiliate || !isTrader) && "orderly-justify-start"
                )}
                onTabChange={onTabChange}
                tabBarExtra={tabBarExtra}
            >
                {affiliatePane}
                {traderPane}
            </Tabs>
        );
    };
}