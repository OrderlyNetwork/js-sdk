import { useMemo } from "react";
import { useReferralInfo, useSymbolLeverage } from "@orderly.network/hooks";
import { SharePnLConfig } from "@orderly.network/ui-share";

export type UseShareButtonScriptOptions = {
  position: any;
  sharePnLConfig?: SharePnLConfig;
  modalId: string;
  iconSize?: number;
  isPositionHistory?: boolean;
};

export const useShareButtonScript = (props: UseShareButtonScriptOptions) => {
  const { sharePnLConfig, position, modalId, iconSize, isPositionHistory } =
    props;
  const { getFirstRefCode } = useReferralInfo();
  const refCode = useMemo(() => {
    return getFirstRefCode()?.code;
  }, [getFirstRefCode]);
  const leverage = useSymbolLeverage(props.position.symbol);
  return {
    iconSize,
    position,
    refCode,
    leverage,
    sharePnLConfig,
    modalId,
    isPositionHistory,
  };
};

export type ShareButtonState = ReturnType<typeof useShareButtonScript>;
