import { Button, TabPane, Tabs, cn, modal } from "@orderly.network/react";
import { useContext, useMemo, useState } from "react";
import { ReferralContext } from "../hooks/referralContext";
import { ReferralIcon } from "./icons/referral";
import { Affiliate } from "../affiliate";
import { TraderIcon } from "./icons/trader";
import { Trader } from "../trader";
import { useMediaQuery } from "@orderly.network/hooks";
import { MEDIA_LG } from "../types/constants";
import { ReferralInputCode } from "../dashboard/sections/enterCode";

export type ReferralTabType = "affiliateTab" | "traderTab";

export const ReferralTab = () => {

    const {
        isAffiliate,
        isTrader,
        becomeAnAffiliate,
        becomeAnAffiliateUrl,
        mutate,
        bindReferralCodeState
    } = useContext(ReferralContext);

    const isLG = useMediaQuery(MEDIA_LG);

    console.log("is LG", isLG);
    

    const [activeTab, setActiveTab] = useState<ReferralTabType>(isAffiliate ? "affiliateTab" : "traderTab")
    const onTabChange = (tab: any) => {
        setActiveTab(tab);
    }


    const enterCode = () => {
        modal.show(ReferralInputCode, { mutate, bindReferralCodeState });
    };

    const tabBarExtra = useMemo(() => {
        if (isAffiliate === true && isTrader === false) {
            return <Button onClick={enterCode} className="orderly-flex orderly-bg-[rgba(0,104,92,1)] lg:orderly-mr-4">
                <TraderIcon />
                <div>As a trader</div>
            </Button>;
        }

        if (isTrader === true && isAffiliate === false) {
            return <Button onClick={() => {
                if (becomeAnAffiliate) {
                    becomeAnAffiliate?.();
                } else if (becomeAnAffiliateUrl) {
                    window.open(becomeAnAffiliateUrl, "__blank");
                }
            }} className="orderly-flex lg:orderly-mr-4">
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
                <Affiliate />
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
                <Trader />
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
    }




    // return (
    //     <div>
    //         <Tabs
    //             key={"referralTab"}
    //             autoFit
    //             value={activeTab}
    //             tabBarClassName={cn(
    //                 "orderly-justify-center orderly-h-[63px]",
    //                 (!isAffiliate || !isTrader) && "orderly-justify-start"
    //             )}
    //             onTabChange={onTabChange}
    //             tabBarExtra={tabBarExtra}
    //         >
    //             {(isAffiliate === true) && <TabPane
    //                 value="affiliateTab"
    //                 title={(
    //                     <div className="orderly-flex orderly-items-center orderly-px-2">
    //                         <ReferralIcon />
    //                         Affilate
    //                     </div>
    //                 )}>
    //                 <Affiliate />
    //             </TabPane>}

    //             {(isTrader && isTrader == true) && <TabPane
    //                 value="traderTab"
    //                 title={(
    //                     <div className="orderly-flex orderly-items-center orderly-px-2">
    //                         <TraderIcon />
    //                         Trader
    //                     </div>
    //                 )}
    //             >
    //                 <Trader />
    //             </TabPane>}
    //         </Tabs>
    //     </div>
    // );
}