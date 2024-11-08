import { useReferralInfo, useSymbolsInfo } from "@orderly.network/hooks";
import { useMemo } from "react";
import { ReferralType, SharePnLConfig, SharePnLParams } from "../types/types";

export const useSharePnLScript = (props: {
    pnl?: (SharePnLConfig & SharePnLParams) | undefined;
    hide?: () => void;
}) => {
  const { pnl, hide } = props;
  const position = pnl?.position;
  const symbolInfo = useSymbolsInfo();
  const { getFirstRefCode } = useReferralInfo();
  const base_dp = symbolInfo[position?.symbol]("base_dp");
  const quote_dp = symbolInfo[position?.symbol]("quote_dp");

  const referralInfo = useMemo((): ReferralType | undefined => {
    const code = getFirstRefCode()?.code;
    const info = {
      code: pnl?.refCode ?? code,
      slogan: pnl?.refSlogan,
      link: pnl?.refLink,
    };

    return info;
  }, [getFirstRefCode, pnl]);
  return {
    position,
    leverage: pnl?.leverage,
    baseDp:base_dp,
    quoteDp:quote_dp,
    referralInfo,
    shareOptions: pnl as SharePnLConfig | undefined,
    hide,
  };
};

export type SharePnLState = ReturnType<typeof useSharePnLScript>;
