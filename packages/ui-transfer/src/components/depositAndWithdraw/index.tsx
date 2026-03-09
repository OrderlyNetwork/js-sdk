import { FC, useState } from "react";
import { useTranslation } from "@orderly.network/i18n";
import {
  ArrowDownSquareFillIcon,
  ArrowUpSquareFillIcon,
  registerSimpleDialog,
  registerSimpleSheet,
  TabPanel,
  Tabs,
} from "@orderly.network/ui";
import { OnrampForm, BuyCryptoIcon } from "@orderly.network/ui-onramp";
import { DepositSlot } from "./depositSlot";
import { WithdrawSlot } from "./withdrawSlot";

export const DepositAndWithdrawWithDialogId = "DepositAndWithdrawWithDialogId";
export const DepositAndWithdrawWithSheetId = "DepositAndWithdrawWithSheetId";

export type DepositAndWithdrawProps = {
  activeTab?: "deposit" | "withdraw" | "onramp";
  close?: () => void;
};

const BuyCryptoTabIcon = (props: React.HTMLAttributes<HTMLDivElement>) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { className: _, ...rest } = props;
  return (
    <div className="oui-flex oui-items-center oui-justify-center" {...rest}>
      <BuyCryptoIcon width={11} height={11} />
    </div>
  );
};

export const DepositAndWithdraw: FC<DepositAndWithdrawProps> = (props) => {
  const [activeTab, setActiveTab] = useState<string>(
    props.activeTab || "deposit",
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
        icon={<ArrowDownSquareFillIcon />}
        value="deposit"
      >
        <DepositSlot close={props.close} />
        {/* <DepositFormWidget close={props.close} /> */}
      </TabPanel>
      <TabPanel
        title={t("common.withdraw")}
        icon={<ArrowUpSquareFillIcon />}
        value="withdraw"
      >
        <WithdrawSlot close={props.close} />
        {/* <WithdrawFormWidget close={props.close} /> */}
      </TabPanel>
      <TabPanel title="Buy Crypto" icon={<BuyCryptoTabIcon />} value="onramp">
        <OnrampForm close={props.close} />
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
