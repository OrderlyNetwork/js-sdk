import React, { FC } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Button, cn } from "@orderly.network/ui";
import type { CloseAllPositionsState } from "./closeAllPositions.script";

export type CloseAllPositionsProps = CloseAllPositionsState & {
  className?: string;
  style?: React.CSSProperties;
};

export const CloseAllPositions: FC<CloseAllPositionsProps> = (props) => {
  const { onCloseAll, hasOpenPositions, isClosing, className, style } = props;
  const { t } = useTranslation();

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
      {t("positions.closeAll")}
    </Button>
  );
};
