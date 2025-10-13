import { useSettleSubscription } from "@kodiak-finance/orderly-hooks";
import { toast } from "@kodiak-finance/orderly-ui";
import { useTranslation } from "@kodiak-finance/orderly-i18n";

export function useSettleEvent() {
  const { t } = useTranslation();

  useSettleSubscription({
    onMessage: (data: any) => {
      const { status } = data;

      // console.log("settle ws: ", data);

      switch (status) {
        case "COMPLETED":
          toast.success(t("settle.settlement.completed"));
          break;
        case "FAILED":
          toast.error(t("settle.settlement.failed"));
          break;
        default:
          break;
      }
    },
  });
}
