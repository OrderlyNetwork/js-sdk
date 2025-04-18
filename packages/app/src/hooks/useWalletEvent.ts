import { useRef } from "react";
import { toast } from "@orderly.network/ui";
import { capitalizeString } from "@orderly.network/utils";
import {
  useEventEmitter,
  useSessionStorage,
  useWalletSubscription,
} from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";

export function useWalletEvent() {
  const { t } = useTranslation();
  const ee = useEventEmitter();

  const recordRef = useRef<Record<number, boolean>>({});

  const [record, setRecord] = useSessionStorage(
    "orderly_wallet_change_id",
    {} as Record<number, boolean>
  );

  recordRef.current = record;

  useWalletSubscription({
    onMessage: (data: any) => {
      console.log("wallet:changed", data);
      const { id, side, transStatus } = data;
      let showToast = true;

      // DEPOSIT and WITHDRAW will push twice COMPLETED and FAILED event
      if (
        ["DEPOSIT", "WITHDRAW"].includes(side) &&
        ["COMPLETED", "FAILED"].includes(transStatus)
      ) {
        const isPushOnce = recordRef.current[id];
        setRecord({
          ...record,
          [id]: isPushOnce ? undefined : true,
        });

        showToast = !isPushOnce;
      }

      if (transStatus === "COMPLETED" && showToast) {
        let msg = `${capitalizeString(side)} completed`;

        if (side === "DEPOSIT") {
          msg = t("transfer.deposit.completed");
        } else if (side === "WITHDRAW") {
          msg = t("transfer.withdraw.completed");
        }

        toast.success(msg);
      } else if (transStatus === "FAILED" && showToast) {
        let msg = `${capitalizeString(side)} failed`;

        if (side === "DEPOSIT") {
          msg = t("transfer.deposit.failed");
        } else if (side === "WITHDRAW") {
          msg = t("transfer.withdraw.failed");
        }
        toast.error(msg);
      }

      ee.emit("wallet:changed", data);
    },
  });
}
