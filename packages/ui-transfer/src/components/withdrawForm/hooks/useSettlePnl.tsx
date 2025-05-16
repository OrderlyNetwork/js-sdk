import { useMemo } from "react";
import {
  useAccount,
  useEventEmitter,
  usePositionStream,
} from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { toast } from "@orderly.network/ui";

export const useSettlePnl = () => {
  const { t } = useTranslation();
  const ee = useEventEmitter();
  const { account } = useAccount();
  const [positionData] = usePositionStream();

  const hasPositions = useMemo(
    () => !positionData?.rows?.length,
    [positionData],
  );

  const onSettlePnl = async () => {
    return account
      .settle()
      .catch((e) => {
        if (e.code == -1104) {
          toast.error(t("settle.settlement.error"));
        }
        if (
          e.message.indexOf(
            "Signing off chain messages with Ledger is not yet supported",
          ) !== -1
        ) {
          ee.emit("wallet:sign-message-with-ledger-error", {
            message: e.message,
            userAddress: account.address,
          });
        }

        if (e.message.indexOf("user rejected") !== -1) {
          toast.error(t("transfer.rejectTransaction"));
        }
        return Promise.reject(e);
      })
      .then((res) => {
        toast.success(t("settle.settlement.requested"));
        return Promise.resolve(res);
      });
  };

  return {
    hasPositions,
    onSettlePnl,
  };
};
