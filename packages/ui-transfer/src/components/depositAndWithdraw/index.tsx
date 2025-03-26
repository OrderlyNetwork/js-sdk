import { FC, useState } from "react";
import {
  registerSimpleDialog,
  registerSimpleSheet,
  TabPanel,
  Tabs,
} from "@orderly.network/ui";
import { DepositIcon, WithdrawIcon } from "../../icons";
import { WithdrawFormWidget } from "../withdrawForm";
import { DepositSlot } from "./plugin";
import { useTranslation } from "@orderly.network/i18n";
export const DepositAndWithdrawWithDialogId = "DepositAndWithdrawWithDialogId";
export const DepositAndWithdrawWithSheetId = "DepositAndWithdrawWithSheetId";

export type DepositAndWithdrawProps = {
  activeTab?: "deposit" | "withdraw";
  close?: () => void;
};

export const DepositAndWithdraw: FC<DepositAndWithdrawProps> = (props) => {
  const [activeTab, setActiveTab] = useState<string>(
    props.activeTab || "deposit"
  );
  const { t } = useTranslation();

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      variant="contained"
      size="lg"
      classNames={{
        tabsList: "oui-px-0",
        tabsContent: "oui-pt-5",
      }}
    >
      <TabPanel
        title={t("common.deposit")}
        icon={<DepositIcon />}
        value="deposit"
      >
        <DepositSlot onClose={props.close} />
      </TabPanel>
      <TabPanel
        title={t("common.withdraw")}
        icon={<WithdrawIcon />}
        value="withdraw"
      >
        <WithdrawFormWidget {...props} />
      </TabPanel>
    </Tabs>
  );
};

registerSimpleDialog(DepositAndWithdrawWithDialogId, DepositAndWithdraw, {
  size: "md",
  classNames: {
    content: "oui-border oui-border-line-6",
  },
});

registerSimpleSheet(DepositAndWithdrawWithSheetId, DepositAndWithdraw);
