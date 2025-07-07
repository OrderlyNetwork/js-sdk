import React from "react";
import { useTranslation } from "@orderly.network/i18n";
import { EditIcon, Text } from "@orderly.network/ui";
import { modal } from "@orderly.network/ui";
import { PositionTPSLPopover, TPSLDialogId } from "@orderly.network/ui-tpsl";
import { usePositionsRowContext } from "./positionRowContext";

// ------------ TP/SL Price input end------------
export const TPSLButton = () => {
  const { position, baseDp, quoteDp, tpslOrder } = usePositionsRowContext();
  const { t } = useTranslation();
  return (
    <PositionTPSLPopover
      position={position}
      order={tpslOrder}
      label={t("common.tpsl")}
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
        className="oui-cursor-pointer oui-text-base-contrast-54"
        size={16}
      />
    </PositionTPSLPopover>
  );
};

export const AddIcon = () => {
  const { position, baseDp, quoteDp, tpslOrder } = usePositionsRowContext();
  const onAdd = () => {
    modal.show(TPSLDialogId, {
      position,
      baseDP: baseDp,
      quoteDP: quoteDp,
      isEditing: false,
    });
  };
  return (
    <Text
      className="oui-text-base-contrast-36 hover:oui-text-base-contrast oui-cursor-pointer"
      onClick={onAdd}
    >
      Add
    </Text>
  );
};
