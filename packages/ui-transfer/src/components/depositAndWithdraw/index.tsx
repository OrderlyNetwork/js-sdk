import { FC, useState } from "react";
import { Box, registerSimpleDialog, TabPanel, Tabs } from "@orderly.network/ui";
import { DepositFormWidget } from "../depositForm";
import { DepositIcon, WithdrawIcon } from "../../icons";

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
        <Box height={300}>Withdraw</Box>
      </TabPanel>
    </Tabs>
  );
};

registerSimpleDialog(DepositAndWithdrawWithDialogId, DepositAndWithdraw, {
  size: "md",
  bodyClassName: "oui-pt-3",
});
