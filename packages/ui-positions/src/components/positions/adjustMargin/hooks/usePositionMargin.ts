import { useMemo } from "react";
import {
  useAppStore,
  useCollateral,
  usePositions,
} from "@orderly.network/hooks";
import { Decimal } from "@orderly.network/utils";

const usePositionMargin = (
  symbol: string,
  isAdd: boolean,
  isolatedMargin: number,
  marginChanged: number,
) => {
  const { freeCollateral, usdcHolding } = useCollateral({
    dp: 2,
  });

  const positions = usePositions();

  const total_cross_unsettled_pnl = useMemo(() => {
    return positions
      ?.filter((item) => (item.margin_mode ?? "CROSS") === "CROSS")
      .reduce((acc, item) => acc.add(item.unsettled_pnl), new Decimal(0));
  }, [positions]);

  // sum_unitary_funding >> fundingRates.sybmol.sum_unitary_funding

  const fundingRates = useAppStore((state) => state.fundingRates);
  const symbolsInfo = useAppStore((state) => state.symbolsInfo);

  const currentPosition = useMemo(() => {
    return positions?.find((item) => item.symbol === symbol);
  }, [positions]);

  const notional = useMemo(() => {
    if (!currentPosition) return null;
    return new Decimal(currentPosition.notional);
  }, [currentPosition]);

  const unSettledPnl = useMemo(() => {
    if (!currentPosition || !notional || !fundingRates) return null;
    const fundingRate = fundingRates[currentPosition.symbol];
    // mark_price * position_qty - cost_position - position_qty * (sum_unitary_funding - last_sum_unitary_funding )
    // notional = mark_price * position_qty
    return notional
      .sub(new Decimal(currentPosition.cost_position))
      .sub(
        new Decimal(currentPosition.position_qty).mul(
          new Decimal(fundingRate.sum_unitary_funding ?? 0).sub(
            new Decimal(currentPosition.last_sum_unitary_funding),
          ),
        ),
      );
  }, [notional, currentPosition, fundingRates]);

  const imr = useMemo(() => {
    // INSERT_YOUR_CODE
    // max(base_IMR, IMR_factor * abs(position_notional)^(4/5))
    if (!symbolsInfo || !symbolsInfo[symbol] || !notional) {
      return null;
    }
    const { base_imr, imr_factor } = symbolsInfo[symbol];
    const baseIMR = new Decimal(base_imr ?? 0);
    const imrFactor = new Decimal(imr_factor ?? 0);
    const absNotional = notional.abs();
    const expFactor = absNotional.pow(new Decimal(4).div(5));
    const value = imrFactor.mul(expFactor);
    return decimalMax(baseIMR, value);
  }, [symbolsInfo, symbol, notional]);

  //   console.log(
  //     "positions",
  //     positions?.length,
  //     "notional",
  //     notional?.toNumber(),
  //     "imr",
  //     imr?.toNumber(),
  //     "usdcHolding",
  //     usdcHolding,
  //     "freeCollateral",
  //     freeCollateral,
  //     "total_cross_unsettled_pnl",
  //     total_cross_unsettled_pnl?.toNumber(),
  //   );
  const maxAmount = useMemo(() => {
    if (isAdd) {
      if (!total_cross_unsettled_pnl) return null;
      // INSERT_YOUR_CODE
      const usdcBalance = new Decimal(usdcHolding);
      const free = new Decimal(freeCollateral);
      const totalCrossUnsettledPnl = total_cross_unsettled_pnl;
      const zero = new Decimal(0);

      const eligible = free.sub(decimalMax(totalCrossUnsettledPnl, zero));
      const minValue = decimalMin(usdcBalance, eligible);
      return decimalMax(minValue, zero).toNumber();
    }
    if (
      !imr ||
      !notional ||
      isolatedMargin === undefined ||
      isolatedMargin === null ||
      !currentPosition
    ) {
      return null;
    }
    const positionNotional = notional;
    const isolatedPositionMargin = new Decimal(isolatedMargin);
    const imrValue = imr;
    const unsettledPnlValue = unSettledPnl ?? new Decimal(0);

    // max(0, isolated position margin - position_notional * imr + min(0, unsettled_pnl))
    const result = isolatedPositionMargin
      .sub(positionNotional.mul(imrValue))
      .add(decimalMin(new Decimal(0), unsettledPnlValue));
    return decimalMax(new Decimal(0), result).toNumber();
  }, [
    total_cross_unsettled_pnl,
    usdcHolding,
    isAdd,
    freeCollateral,
    unSettledPnl,
    isolatedMargin,
  ]);

  const liquidationPrice = useMemo(() => {
    if (!unSettledPnl) return null;
    if (isAdd) {
      return new Decimal(isolatedMargin)
        .add(unSettledPnl)
        .add(marginChanged)
        .toNumber();
    }
    return new Decimal(isolatedMargin)
      .add(unSettledPnl)
      .sub(marginChanged)
      .toNumber();
  }, [isolatedMargin, unSettledPnl, marginChanged]);

  const total_collateral_value = useMemo(() => {
    if (!unSettledPnl) return null;
    if (isAdd) {
      return new Decimal(isolatedMargin)
        .add(marginChanged)
        .add(unSettledPnl)
        .toNumber();
    }
    return new Decimal(isolatedMargin)
      .sub(marginChanged)
      .add(unSettledPnl)
      .toNumber();
  }, [isAdd, isolatedMargin, unSettledPnl, marginChanged]);

  const effectiveLeverage = useMemo(() => {
    if (!notional || !total_collateral_value) return null;
    return notional.div(total_collateral_value).toNumber();
  }, [notional, total_collateral_value]);

  return {
    maxAmount,
    liquidationPrice,
    effectiveLeverage,
  };
};

function decimalMax(a: Decimal, b: Decimal) {
  return a.gte(b) ? a : b;
}

function decimalMin(a: Decimal, b: Decimal) {
  return a.lte(b) ? a : b;
}

export default usePositionMargin;
