import React from "react";
import { useSymbolLeverage } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { EditIcon, Text } from "@orderly.network/ui";
import { PositionTPSLPopover } from "@orderly.network/ui-tpsl";
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

export const LeverageBadge = ({ symbol }: { symbol: string }) => {
  if (!symbol) return null;
  return (
    <div className="oui-flex oui-h-[18px] oui-items-center oui-gap-1 oui-rounded oui-bg-white/[0.06] oui-px-2 oui-text-2xs oui-font-semibold oui-text-base-contrast-36">
      <Text>Cross</Text>
      <LeverageDisplay symbol={symbol} />
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
