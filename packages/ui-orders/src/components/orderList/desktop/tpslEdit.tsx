import { useTranslation } from "@veltodefi/i18n";
import { API } from "@veltodefi/types";
import { PositionTPSLPopover } from "@veltodefi/ui-tpsl";
import { useSymbolContext } from "../../provider/symbolContext";
import { useTPSLOrderRowContext } from "../tpslOrderRowContext";

export const TP_SLEditButton = (props: { order: API.Order }) => {
  const { position, order } = useTPSLOrderRowContext();
  const { quote_dp, base_dp } = useSymbolContext();
  const { t } = useTranslation();

  return (
    <PositionTPSLPopover
      quoteDP={quote_dp}
      baseDP={base_dp}
      position={position!}
      order={order}
      label={t("common.edit")}
      isEditing
    />
  );
};
