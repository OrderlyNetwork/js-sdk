import { TabPane, Tabs, cn } from "@orderly.network/react";
import { FC, useCallback, useState } from "react";
import { CommissionList } from "./commission";
import { RefereesList } from "./referees";

type TabType = "commission" | "referees";

export const CommissionAndReferees:FC<{className?: string}> = (props) => {
    const [activeTab, setActiveTab] = useState<TabType>("commission");


    const onTabChange = useCallback((value: any) => {
        setActiveTab(value);
    }, []);

    return (
        <div className={cn("orderly-p-3 orderly-rounded-lg orderly-pb-1 orderly-outline orderly-outline-1 orderly-outline-base-600", props.className)}>
            <Tabs
                autoFit
                value={activeTab}
                onTabChange={onTabChange}
            >

                <TabPane
                    title="Commission"
                    value="comission"
                >
                    <CommissionList date="2024-02-01 00:00 UTC" dataSource={[1, 2, 3, 4, 5]} />
                </TabPane>


                <TabPane
                    title="My referees"
                    value="referees"
                >
                    <RefereesList date="2024-02-01 00:00 UTC" dataSource={[1, 2, 3, 4, 5]} />

                </TabPane>

            </Tabs>
        </div>
    );
}