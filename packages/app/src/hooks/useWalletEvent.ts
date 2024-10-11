import { useRef } from "react";
import { toast } from "@orderly.network/ui";
import { capitalizeString } from "@orderly.network/utils";
import {
  useEventEmitter,
  useSessionStorage,
  useWalletSubscription,
} from "@orderly.network/hooks";

export function useWalletEvent() {
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
        toast.success(msg);
      } else if (transStatus === "FAILED" && showToast) {
        let msg = `${capitalizeString(side)} failed`;
        toast.error(msg);
      }

      ee.emit("wallet:changed", data);
    },
  });
}
