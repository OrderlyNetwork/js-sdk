import { useMemo } from "react";
import { account } from "@orderly.network/perp";
import { Decimal } from "@orderly.network/utils";
import { useHoldingStream, useIndexPricesStream, usePositionStream } from "..";
import { useTokensInfo } from "./useTokensInfo/tokensInfo.store";

const { LTV, collateralRatio } = account;

export const useCurrentLtv = () => {
  const { usdc, data: holdingList = [] } = useHoldingStream();

  const tokensInfo = useTokensInfo();

  const { data: indexPrices } = useIndexPricesStream();

  const [data] = usePositionStream();

  const unrealPnL = data?.aggregated?.total_unreal_pnl ?? 0;

  const currentLtv = useMemo(() => {
    const usdcBalance = usdc?.holding ?? 0;
    return LTV({
      usdcBalance: usdcBalance,
      upnl: unrealPnL,
      collateralAssets: holdingList.map((item) => {
        const indexPrice =
          item.token === "USDC" ? 1 : indexPrices[`PERP_${item.token}_USDC`];
        const findToken = tokensInfo?.find(
          (token) => token.token === item.token,
        );
        const qty = item?.holding ?? 0;
        return {
          qty: qty,
          indexPrice: indexPrice ?? 1,
          weight: collateralRatio({
            baseWeight: findToken?.base_weight ?? 0,
            discountFactor: findToken?.discount_factor ?? 0,
            collateralQty: qty,
            indexPrice: indexPrice ?? 1,
          }),
        };
      }),
    });
  }, [usdc?.holding, unrealPnL, holdingList, indexPrices, tokensInfo]);

  return new Decimal(currentLtv)
    .mul(100)
    .toDecimalPlaces(2, Decimal.ROUND_DOWN)
    .toNumber();
};
