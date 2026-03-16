import { useLeverageBySymbol } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { PositionType } from "@orderly.network/types";
import { cn, EditIcon, Text, useScreen } from "@orderly.network/ui";
import { modal } from "@orderly.network/ui";
import {
  PositionTPSLPopover,
  TPSLDetailDialogId,
  TPSLDialogId,
  TPSLSheetId,
  TPSLDetailSheetId,
} from "@orderly.network/ui-tpsl";
import { Decimal } from "@orderly.network/utils";
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
  const { t } = useTranslation();
  const { isMobile } = useScreen();
  const onAdd = () => {
    const dialogId = isMobile ? TPSLSheetId : TPSLDialogId;
    const modalParams = {
      position,
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

type LeverageBadgeProps = {
  symbol: string;
  leverage: number;
  modalId: string;
};

export const LeverageBadge = (props: LeverageBadgeProps) => {
  const { symbol, leverage } = props;

  const showModal = () => {
    modal.show(props.modalId, {
      symbol,
      curLeverage: Number(leverage),
    });
  };

  return (
    <div
      className={cn(
        "oui-flex oui-h-[18px] oui-items-center oui-gap-1",
        "oui-cursor-pointer oui-rounded oui-bg-line-6 oui-px-2",
        "oui-text-2xs oui-font-semibold oui-text-base-contrast-36",
      )}
      onClick={showModal}
    >
      {leverage ? (
        <Text.numeral dp={0} rm={Decimal.ROUND_DOWN} size="2xs" unit="X">
          {leverage}
        </Text.numeral>
      ) : (
        <LeverageDisplay symbol={symbol} />
      )}
    </div>
  );
};

/** TODO: remove this */
export const LeverageDisplay = ({ symbol }: { symbol: string }) => {
  const leverage = useLeverageBySymbol(symbol);

  return (
    <Text.numeral dp={0} rm={Decimal.ROUND_DOWN} size="2xs" unit="X">
      {leverage || 1}
    </Text.numeral>
  );
};
