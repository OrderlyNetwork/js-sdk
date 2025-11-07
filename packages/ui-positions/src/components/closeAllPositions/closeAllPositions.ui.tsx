import React, { FC } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Button, cn } from "@orderly.network/ui";
import { formatSymbol } from "@orderly.network/utils";
import type { CloseAllPositionsState } from "./closeAllPositions.script";

export type CloseAllPositionsProps = CloseAllPositionsState & {
  className?: string;
  style?: React.CSSProperties;
};

export const CloseAllPositions: FC<CloseAllPositionsProps> = (props) => {
  const { onCloseAll, hasOpenPositions, isClosing, className, style, symbol } =
    props;
  const { t } = useTranslation();

  console.log("CloseAllPositions props", props.symbol);
  const formattedSymbol = props.symbol
    ? formatSymbol(props.symbol, "base")
    : props.symbol;
  return (
    <Button
      onClick={onCloseAll}
      disabled={!hasOpenPositions || isClosing}
      loading={isClosing}
      variant="outlined"
      color="secondary"
      size="xs"
      className={cn("disabled:oui-bg-transport", className)}
      style={style}
    >
      {symbol
        ? t("positions.closeAll.ofSymbol", { symbol: formattedSymbol })
        : t("positions.closeAll")}
    </Button>
  );
};
