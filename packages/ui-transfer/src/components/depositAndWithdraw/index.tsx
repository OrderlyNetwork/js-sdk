import { FC, useState } from "react";
import { Box, registerSimpleDialog, TabPanel, Tabs } from "@orderly.network/ui";
import { DepositFormWidget } from "../depositForm";
import { DepositIcon, WithdrawIcon } from "../../icons";
import {WithdrawFormWidget} from "../withdrawForm";

export const DepositAndWithdrawWithDialogId = "DepositAndWithdrawWithDialogId";
export type DepositAndWithdrawProps = {
  activeTab?: "deposit" | "withdraw";
};

export const DepositAndWithdraw: FC<DepositAndWithdrawProps> = (props) => {
  const [activeTab, setActiveTab] = useState<string>(
    props.activeTab || "deposit"
  );

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      classNames={{
        tabsList: "oui-px-0",
        tabsContent: "oui-pt-5",
      }}
    >
      <TabPanel title="Deposit" icon={<DepositIcon />} value="deposit">
        <DepositFormWidget />
      </TabPanel>
      <TabPanel title="Withdraw" icon={<WithdrawIcon />} value="withdraw">
        <WithdrawFormWidget/>
      </TabPanel>
    </Tabs>
  );
};

registerSimpleDialog(DepositAndWithdrawWithDialogId, DepositAndWithdraw, {
  size: "md",
  bodyClassName: "oui-pt-3",
});
