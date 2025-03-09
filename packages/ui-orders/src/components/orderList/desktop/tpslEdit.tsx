import { API } from "@orderly.network/types";
import { PositionTPSLPopover } from "@orderly.network/ui-tpsl";
import { useTPSLOrderRowContext } from "../tpslOrderRowContext";
import { useSymbolContext } from "../symbolProvider";
import { useTranslation } from "@orderly.network/i18n";

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
