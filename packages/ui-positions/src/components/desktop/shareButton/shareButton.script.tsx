import { useReferralInfo, useSymbolLeverage } from "@orderly.network/hooks";
import { SharePnLConfig, SharePnLParams } from "@orderly.network/ui-share";
import { useMemo } from "react";

export const useShareButtonScript = (props: {
  position: any;
  sharePnLConfig?: SharePnLConfig &
    Partial<Omit<SharePnLParams, "position" | "refCode" | "leverage">>;
    modalId: string;
    iconSize?: number;
}) => {
  const { sharePnLConfig, position, modalId, iconSize } = props;
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
  };
};

export type ShareButtonState = ReturnType<typeof useShareButtonScript>;
