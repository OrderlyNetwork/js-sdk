import { PositionTPSLPopover } from "@orderly.network/ui-tpsl";
import { usePositionsRowContext } from "./positionRowContext";
import { EditIcon } from "@orderly.network/ui";
import { useTranslation } from "@orderly.network/i18n";

// ------------ TP/SL Price input end------------
export const TPSLButton = () => {
  const { position, baseDp, quoteDp, tpslOrder } = usePositionsRowContext();
  const { t } = useTranslation();
  return (
    <PositionTPSLPopover
      position={position}
      order={tpslOrder}
      label={t("tpsl.title")}
      baseDP={baseDp}
      quoteDP={quoteDp}
      isEditing={false}
    />
  );
};

export const TPSLEditIcon = () => {
  const { position, baseDp, quoteDp, tpslOrder } = usePositionsRowContext();

  return (
    <PositionTPSLPopover
      position={position}
      order={tpslOrder}
      baseDP={baseDp}
      quoteDP={quoteDp}
      isEditing
    >
      <EditIcon
        opacity={1}
        className="oui-text-base-contrast-54 oui-cursor-pointer"
        size={16}
      />
    </PositionTPSLPopover>
  );
};
