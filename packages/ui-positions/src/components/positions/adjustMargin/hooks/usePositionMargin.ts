import { useMemo } from "react";
import {
  useAppStore,
  useCollateral,
  usePositions,
} from "@orderly.network/hooks";
import { account } from "@orderly.network/perp";
import { Decimal } from "@orderly.network/utils";

const usePositionMargin = (
  symbol: string,
  isAdd: boolean,
  isolatedMargin: number,
  /**
   * finalMargin = if isAdd ? isolatedMargin + margin_add : isolatedMargin - margin_reduction
   */
  finalMargin: number,
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
      return account.maxAdd({
        USDCHolding: usdcHolding,
        freeCollateral: freeCollateral,
        totalCrossUnsettledPnL: total_cross_unsettled_pnl.toNumber(),
      });
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
    const imrValue = imr;
    const unsettledPnlValue = unSettledPnl ?? new Decimal(0);

    return account.maxReduce({
      isolatedPositionMargin: isolatedMargin,
      positionNotional: positionNotional.toNumber(),
      imr: imrValue.toNumber(),
      positionUnsettledPnL: unsettledPnlValue.toNumber(),
    });
  }, [
    total_cross_unsettled_pnl,
    usdcHolding,
    isAdd,
    freeCollateral,
    unSettledPnl,
    isolatedMargin,
  ]);

  // Calculate liquidation price after margin adjustment
  // Note: This calculation may need review based on liquidation price formula
  const liquidationPrice = useMemo(() => {
    if (!unSettledPnl) return null;
    if (isAdd) {
      // Add margin: isolatedMargin + unSettledPnl + finalMargin
      return new Decimal(isolatedMargin)
        .add(unSettledPnl)
        .add(finalMargin)
        .toNumber();
    }
    // Reduce margin: isolatedMargin + unSettledPnl - finalMargin
    return new Decimal(isolatedMargin)
      .add(unSettledPnl)
      .sub(finalMargin)
      .toNumber();
  }, [isolatedMargin, unSettledPnl, finalMargin]);

  const total_collateral_value = useMemo(() => {
    if (!unSettledPnl) return null;
    // Add: finalMargin = isolatedMargin + margin_add
    // Reduce: finalMargin = isolatedMargin - margin_reduction
    // so total_collateral_value = finalMargin + unsettled_pnl
    return new Decimal(finalMargin).add(unSettledPnl).toNumber();
  }, [unSettledPnl, finalMargin]);

  const effectiveLeverage = useMemo(() => {
    if (!notional || !total_collateral_value) return null;
    return notional.div(total_collateral_value).toNumber();
  }, [notional, total_collateral_value]);

  console.log(
    "effectiveLeverage",
    effectiveLeverage,
    "notional=",
    notional?.toNumber(),
    "total_collateral_value=",
    total_collateral_value,
    "isolatedMargin=",
    isolatedMargin,
    "finalMargin=",
    finalMargin,
    "unSettledPnl=",
    unSettledPnl?.toNumber(),
  );

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
