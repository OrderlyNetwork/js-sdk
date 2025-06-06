import { FC } from "react";
import { useTranslation } from "@orderly.network/i18n";
import {
  registerSimpleDialog,
  TabPanel,
  Tabs,
  ArrowLeftRightSquareFill,
} from "@orderly.network/ui";
import { registerSimpleSheet } from "@orderly.network/ui";
import {
  TransferFormScriptOptions,
  useTransferFormScript,
} from "./transferForm.script";
import { TransferForm } from "./transferForm.ui";

export const TransferDialogId = "TransferDialogId";
export const TransferSheetId = "TransferSheetId";

export type TransferFormWidgetProps = TransferFormScriptOptions;

export const TransferFormWidget = (props: TransferFormWidgetProps) => {
  const state = useTransferFormScript({
    toAccountId: props.toAccountId,
    close: props.close,
  });
  return <TransferForm {...state} />;
};

export const TransferWidget: FC<TransferFormWidgetProps> = (props) => {
  const { t } = useTranslation();

  return (
    <Tabs
      value="transfer"
      variant="contained"
      size="lg"
      classNames={{
        tabsList: "oui-px-0",
        tabsContent: "oui-pt-5",
      }}
    >
      <TabPanel
        title={t("common.transfer")}
        icon={<ArrowLeftRightSquareFill />}
        value="transfer"
      >
        <TransferFormWidget
          close={props.close}
          toAccountId={props.toAccountId}
        />
      </TabPanel>
    </Tabs>
  );
};

registerSimpleDialog(TransferDialogId, TransferWidget, {
  size: "md",
  classNames: {
    content: "oui-border oui-border-line-6",
  },
});

registerSimpleSheet(TransferSheetId, TransferWidget);
