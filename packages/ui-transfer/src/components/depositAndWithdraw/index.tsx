import { FC, useState } from "react";
import { registerSimpleDialog, TabPanel, Tabs } from "@orderly.network/ui";
import { DepositFormWidget } from "../depositForm";
import { DepositIcon, WithdrawIcon } from "../../icons";

export const DepositAndWithdrawWithDialogId = "DepositAndWithdrawWithDialogId";

export const DepositAndWithdraw: FC<{}> = (props) => {
  const [activeTab, setActiveTab] = useState("deposit");

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
        <DepositFormWidget />
      </TabPanel>
    </Tabs>
  );
};

registerSimpleDialog(DepositAndWithdrawWithDialogId, DepositAndWithdraw, {
  size: "md",
  bodyClassName: "oui-pt-3",
});
