import { useSettleSubscription } from "@orderly.network/hooks";
import { toast } from "@orderly.network/ui";

export function useSettleEvent() {
  useSettleSubscription({
    onMessage: (data: any) => {
      const { status } = data;

      // console.log("settle ws: ", data);

      switch (status) {
        case "COMPLETED":
          toast.success("Settlement completed");
          break;
        case "FAILED":
          toast.error("Settlement failed");
          break;
        default:
          break;
      }
    },
  });
}
