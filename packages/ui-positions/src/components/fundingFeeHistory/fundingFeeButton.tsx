import { FC } from "react";
import { useBoolean } from "@kodiak-finance/orderly-hooks";
import { useTranslation } from "@kodiak-finance/orderly-i18n";
import {
  SimpleDialog,
  SimpleSheet,
  Text,
  useScreen,
} from "@kodiak-finance/orderly-ui";
import { FundingFeeHistoryUI } from "./fundingFeeHistory.ui";

export const FundingFeeButton: FC<{
  fee: number;
  symbol: string;
  start_t: string;
  end_t: string;
}> = ({ fee, symbol, start_t, end_t }) => {
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
          <FundingFeeHistoryUI
            total={fee}
            symbol={symbol}
            start_t={start_t}
            end_t={end_t}
          />
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
          <FundingFeeHistoryUI
            total={fee}
            symbol={symbol}
            start_t={start_t}
            end_t={end_t}
          />
        </SimpleDialog>
      )}
    </>
  );
};
