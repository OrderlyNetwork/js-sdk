import { FC } from "react";
import { useBoolean } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import {
  SimpleDialog,
  SimpleSheet,
  Text,
  useScreen,
} from "@orderly.network/ui";
import { FundingFeeHistoryUI } from "./fundingFeeHistory.ui";

export const FundingFeeButton: FC<{
  fee: string;
  symbol: string;
}> = ({ fee, symbol }) => {
  const { t } = useTranslation();
  const [isOpen, { setTrue, setFalse }] = useBoolean(false);
  const { isMobile } = useScreen();

  return (
    <>
      <button onClick={setTrue}>
        <Text.numeral
          rule="price"
          coloring
          showIdentifier
          ignoreDP
          className="oui-border-b oui-border-line-16 oui-border-dashed oui-py-0.5"
        >
          {fee}
        </Text.numeral>
      </button>
      {isMobile ? (
        <SimpleSheet
          open={isOpen}
          onOpenChange={setFalse}
          title={t("funding.fundingFee")}
          classNames={{
            body: "oui-max-h-[80vh] oui-py-0",
          }}
        >
          <FundingFeeHistoryUI total={fee} symbol={symbol} />
        </SimpleSheet>
      ) : (
        <SimpleDialog
          open={isOpen}
          onOpenChange={setFalse}
          title={t("funding.fundingFee")}
          classNames={{
            content: "lg:oui-max-w-[640px]",
            body: "oui-max-h-[80vh] oui-bg-base-8 lg:oui-py-0",
          }}
        >
          <FundingFeeHistoryUI total={fee} symbol={symbol} />
        </SimpleDialog>
      )}
    </>
  );
};
