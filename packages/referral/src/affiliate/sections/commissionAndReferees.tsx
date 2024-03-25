import { TabPane, Tabs, cn } from "@orderly.network/react";
import { FC, useCallback, useMemo, useState } from "react";
import { CommissionList } from "./commission";
import { RefereesList } from "./referees";

type TabType = "commission" | "referees";

export const CommissionAndReferees: FC<{ className?: string }> = (props) => {
    const [activeTab, setActiveTab] = useState<TabType>("commission");
    const [dateText, setDateText] = useState<string | undefined>(undefined);



    const onTabChange = useCallback((value: any) => {
        setActiveTab(value);
    }, []);


    return (
        <div className={cn("orderly-referral-tab orderly-p-3 orderly-rounded-lg orderly-pb-1 orderly-outline orderly-outline-1 orderly-outline-base-600", props.className)}>
            <Tabs
                id="commission_referees_tab"
                autoFit
                value={activeTab}
                onTabChange={onTabChange}
                tabBarClassName="orderly-referral-tab-bar orderly-h-[61px] orderly-text-xs md:orderly-text-base 2xl:orderly-text-lg"
                tabBarExtra={
                    <div className="orderly-mt-1 orderly-px-4 orderly-py-2 sm:orderly-flex orderly-items-center orderly-invisible orderly-w-0 md:orderly-visible md:orderly-w-auto orderly-text-3xs orderly-text-base-contrast-36">{dateText}</div>
                }
                identifierClassName={"after:orderly-bg-gradient-to-l after:orderly-from-referral-text-from after:orderly-to-referral-text-to"}
            >

                <TabPane
                    title="Commission"
                    value="commission"
                >
                    <CommissionList dateText={dateText} setDateText={setDateText} />
                </TabPane>


                <TabPane
                    title="My referees"
                    value="referees"
                >
                    <RefereesList dateText={dateText} setDateText={setDateText} />

                </TabPane>

            </Tabs>
        </div>
    );
}