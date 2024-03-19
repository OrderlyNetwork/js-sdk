import { TabPane, Tabs, cn } from "@orderly.network/react";
import { FC, useCallback, useState } from "react";
import { CommissionList } from "./commission";
import { RefereesList } from "./referees";
import { useCommission } from "../../hooks/useCommission";

type TabType = "commission" | "referees";

export const CommissionAndReferees:FC<{className?: string}> = (props) => {
    const [activeTab, setActiveTab] = useState<TabType>("commission");
    const [dateText, setDateText] = useState<string | undefined>(undefined);

   

    const onTabChange = useCallback((value: any) => {
        setActiveTab(value);
    }, []);

    return (
        <div className={cn("orderly-p-3 orderly-rounded-lg orderly-pb-1 orderly-outline orderly-outline-1 orderly-outline-base-600", props.className)}>
            <Tabs
                autoFit
                value={activeTab}
                onTabChange={onTabChange}
                tabBarClassName="orderly-h-[61px]"
            >

                <TabPane
                    title="Commission"
                    value="comission"
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