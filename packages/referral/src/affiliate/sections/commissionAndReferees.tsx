import { TabPane, Tabs, cn } from "@orderly.network/react";
import { FC, useCallback, useMemo, useState } from "react";
import { CommissionList } from "./commission";
import { RefereesList } from "./referees";
import { useCommission } from "../../hooks/useCommission";
import { useMediaQuery } from "@orderly.network/hooks";
import { MEDIA_MD, MEDIA_SM } from "../../types/constants";

type TabType = "commission" | "referees";

export const CommissionAndReferees: FC<{ className?: string }> = (props) => {
    const [activeTab, setActiveTab] = useState<TabType>("commission");
    const [dateText, setDateText] = useState<string | undefined>(undefined);



    const onTabChange = useCallback((value: any) => {
        setActiveTab(value);
    }, []);


    return (
        <div className={cn("orderly-p-3 orderly-rounded-lg orderly-pb-1 orderly-outline orderly-outline-1 orderly-outline-base-600", props.className)}>
            <Tabs
            id="cvbnkdhb"
                autoFit
                value={activeTab}
                onTabChange={onTabChange}
                tabBarClassName="orderly-h-[61px]"
                tabBarExtra={
                    <div className="orderly-mt-1 orderly-px-4 orderly-py-2 sm:orderly-flex orderly-items-center orderly-invisible orderly-w-0 md:orderly-visible md:orderly-w-auto orderly-text-3xs orderly-text-base-contrast-36">{dateText}</div>
                }
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