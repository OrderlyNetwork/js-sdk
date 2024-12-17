import { useReferralInfo, useSymbolLeverage } from "@orderly.network/hooks";
import { SharePnLConfig, SharePnLParams } from "@orderly.network/ui-share";
import { useMemo } from "react";

export const useShareButtonScript = (props: {
  order: any;
  sharePnLConfig?: SharePnLConfig &
    Partial<Omit<SharePnLParams, "position" | "refCode" | "leverage">>;
    modalId: string;
    iconSize?: number;
}) => {
  const { sharePnLConfig, order, modalId, iconSize } = props;
  const { getFirstRefCode } = useReferralInfo();
  const refCode = useMemo(() => {
    return getFirstRefCode()?.code;
  }, [getFirstRefCode]);
  const leverage = useSymbolLeverage(props.order.symbol);
  return {
    iconSize,
    order,
    refCode,
    leverage,
    sharePnLConfig,
    modalId,
  };
};

export type ShareButtonState = ReturnType<typeof useShareButtonScript>;
