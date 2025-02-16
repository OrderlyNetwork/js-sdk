import { useMemo } from "react";
import { useReferralInfo, useSymbolLeverage } from "@orderly.network/hooks";
import { SharePnLConfig } from "@orderly.network/ui-share";

export const useShareButtonScript = (props: {
  order: any;
  sharePnLConfig?: SharePnLConfig;
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
