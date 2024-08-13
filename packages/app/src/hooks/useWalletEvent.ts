import { toast } from "@orderly.network/ui";
import { capitalizeString } from "@orderly.network/utils";
import { useEventEmitter, useWalletSubscription } from "@orderly.network/hooks";

export function useWalletEvent() {
  const ee = useEventEmitter();

  useWalletSubscription({
    onMessage: (data: any) => {
      const { side, transStatus } = data;

      if (transStatus === "COMPLETED") {
        let msg = `${capitalizeString(side)} completed`;
        toast.success(msg);
      } else if (transStatus === "FAILED") {
        let msg = `${capitalizeString(side)} failed`;
        toast.error(msg);
      }

      ee.emit("wallet:changed", data);
    },
  });
}
