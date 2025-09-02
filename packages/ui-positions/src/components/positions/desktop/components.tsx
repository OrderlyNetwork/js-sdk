import React from "react";
import { ComputedAlgoOrder, useLocalStorage } from "@orderly.network/hooks";
import { useSymbolLeverage } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { PositionType } from "@orderly.network/types";
import { cn, EditIcon, Text, toast, useScreen } from "@orderly.network/ui";
import { modal } from "@orderly.network/ui";
import {
  PositionTPSLPopover,
  TPSLDetailDialogId,
  TPSLDialogId,
  TPSLSheetId,
  TPSLDetailSheetId,
} from "@orderly.network/ui-tpsl";
import { usePositionsRowContext } from "../positionsRowContext";

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
  const { isMobile } = useScreen();

  const onEdit = () => {
    const dialogId = isMobile ? TPSLDetailSheetId : TPSLDetailDialogId;
    modal.show(dialogId, {
      order: tpslOrder,
      position: position,
      baseDP: baseDp,
      quoteDP: quoteDp,
    });
  };

  return (
    // <PositionTPSLPopover
    //   position={position}
    //   order={tpslOrder}
    //   baseDP={baseDp}
    //   quoteDP={quoteDp}
    //   isEditing
    // >
    <EditIcon
      onClick={onEdit}
      opacity={1}
      className="oui-cursor-pointer oui-text-base-contrast-54"
      size={16}
    />
    // </PositionTPSLPopover>
  );
};

export const AddIcon = (props: { positionType: PositionType }) => {
  const { position, baseDp, quoteDp, tpslOrder } = usePositionsRowContext();
  const [needConfirm] = useLocalStorage("orderly_order_confirm", true);
  const { t } = useTranslation();
  const { isMobile } = useScreen();
  const onAdd = () => {
    const dialogId = isMobile ? TPSLSheetId : TPSLDialogId;
    const modalParams = {
      symbol: position.symbol,
      baseDP: baseDp,
      quoteDP: quoteDp,
      isEditing: false,
      positionType: props.positionType,
    };
    modal.show(dialogId, modalParams);
  };
  return (
    <Text
      className={cn(
        "oui-cursor-pointer oui-text-base-contrast",
        isMobile && "oui-text-base-contrast-80",
      )}
      onClick={onAdd}
    >
      {t("tpsl.add")}
    </Text>
  );
};

export const LeverageBadge = ({
  symbol,
  leverage,
}: {
  symbol: string;
  leverage: number;
}) => {
  if (!symbol) return null;

  return (
    <div className="oui-flex oui-h-[18px] oui-items-center oui-gap-1 oui-rounded oui-bg-white/[0.06] oui-px-2 oui-text-2xs oui-font-semibold oui-text-base-contrast-36">
      <Text>Cross</Text>
      {leverage ? (
        <Text.numeral dp={0} size="2xs" unit="X">
          {leverage}
        </Text.numeral>
      ) : (
        <LeverageDisplay symbol={symbol} />
      )}
    </div>
  );
};

export const LeverageDisplay = ({ symbol }: { symbol: string }) => {
  const leverage = useSymbolLeverage(symbol);

  return (
    <Text.numeral dp={0} size="2xs" unit="X">
      {leverage !== "-" ? leverage : "--"}
    </Text.numeral>
  );
};
