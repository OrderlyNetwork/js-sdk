import { FC } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { cn, Text, TokenIcon } from "@orderly.network/ui";
import { VaultOperation } from "../../../types/vault";
import { getOperationStatusColor } from "../../../utils/getOperationStatusColor";
import { WithdrawProcessWidget } from "../withdraw/withdraw-process.ui";

export type LatestWithdrawUIProps = {
  latestOperation: VaultOperation | undefined;
};

export const LatestWithdrawUI: FC<LatestWithdrawUIProps> = (props) => {
  const { latestOperation } = props;
  const { t } = useTranslation();
  if (!latestOperation) {
    return <WithdrawProcessWidget />;
  }

  return (
    <div className="oui-mt-3 oui-flex oui-flex-col oui-gap-2">
      <div className="oui-text-xs oui-font-normal oui-text-base-contrast-54">
        {t("vaults.withdraw.latestWithdraw")}
      </div>
      <div className="oui-h-[44px] oui-rounded-lg oui-border oui-border-white/[0.12] oui-p-3">
        <div className="oui-flex oui-items-center">
          <div
            className={cn(
              "oui-mr-1 oui-size-1 oui-rounded-full",
              latestOperation.status === "completed" && "oui-bg-success",
              latestOperation.status === "rejected" && "oui-bg-danger",
              latestOperation.status === "failed" && "oui-bg-danger",
              (latestOperation.status === "pending" ||
                latestOperation.status === "new") &&
                "oui-bg-primary",
            )}
          />
          <Text
            color={getOperationStatusColor(latestOperation.status)}
            className="oui-text-xs oui-font-normal"
          >
            {latestOperation.status.slice(0, 1).toUpperCase() +
              latestOperation.status.slice(1)}
          </Text>
          <TokenIcon name="USDC" className="oui-ml-auto oui-mr-1 oui-size-4" />
          <Text.numeral className="oui-text-sm oui-font-semibold oui-text-base-contrast-80">
            {latestOperation.amount_change || "-"}
          </Text.numeral>
        </div>
      </div>
    </div>
  );
};
