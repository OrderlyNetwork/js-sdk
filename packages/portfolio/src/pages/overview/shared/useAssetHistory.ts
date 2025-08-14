import { useMemo, useState } from "react";
import { subDays, format, getYear, getMonth, getDate, addDays } from "date-fns";
import {
  useAssetsHistory,
  useCollateral,
  useLocalStorage,
  useStatisticsDaily,
} from "@orderly.network/hooks";
import { API } from "@orderly.network/types";
import { Decimal, zero } from "@orderly.network/utils";

export enum PeriodType {
  WEEK = "7D",
  MONTH = "30D",
  QUARTER = "90D",
}

export const useAssetsHistoryData = (
  localKey: string,
  options?: {
    isRealtime?: boolean;
  },
) => {
  const [today] = useState(() => {
    const d = new Date();

    return d;

    // return new Date(
    //   Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0),
    // );
  });

  const { isRealtime = false } = options || {};
  const periodTypes = Object.values(PeriodType);
  const [period, setPeriod] = useLocalStorage<PeriodType>(
    localKey,
    PeriodType.WEEK,
  );

  const { totalValue } = useCollateral();

  const getStartDate = (value: PeriodType) => {
    switch (value) {
      case PeriodType.MONTH:
        return subDays(today, 35);

      case PeriodType.QUARTER:
        return subDays(today, 95);
      default:
        return subDays(today, 10);
    }
  };

  const periodValue = useMemo(() => {
    switch (period) {
      case PeriodType.WEEK:
        return 7;
      case PeriodType.MONTH:
        return 30;
      case PeriodType.QUARTER:
        return 90;
      default:
        return 7;
    }
  }, [period]);

  const [startDate, setStartDate] = useState(getStartDate(period));
  // const nowStamp = useRef(new Date().getTime().toString());
  // const now = useRef(new Date());

  // const endDate = useMemo(() => addDays(today, 1), [today]);
  const endDate = today;

  const [data] = useStatisticsDaily(
    {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    },
    {
      ignoreAggregation: true,
    },
  );

  const [assetHistory] = useAssetsHistory({
    startTime: subDays(today, 2).getTime(),
    endTime: endDate.getTime(),
    pageSize: 50,
  });

  const onPeriodChange = (value: PeriodType) => {
    setStartDate(getStartDate(value));
    setPeriod(value);
  };

  // const lastItem = data[data.length - 1];

  const calculateLastPnl = (inputs: {
    lastItem: API.DailyRow;
    assetHistory: ReadonlyArray<API.AssetHistoryRow> | API.AssetHistoryRow[];
    totalValue: number | null;
  }) => {
    if (totalValue == null) {
      return null;
    }
    // today daily pnl = totalValue - lastItem.account_value - deposit + withdraw
    let value = new Decimal(totalValue).sub(inputs.lastItem.account_value);

    // subtraction of deposit and withdraw
    if (
      Array.isArray(inputs.assetHistory) &&
      inputs.assetHistory.length > 0 &&
      typeof inputs.lastItem.snapshot_time !== "undefined"
    ) {
      // find a list with the timestamp greater than the last item timestamp and trans_status = success;
      const list = [];

      for (let i = 0; i < inputs.assetHistory.length; i++) {
        const item = inputs.assetHistory[i];
        if (item.created_time > inputs.lastItem.snapshot_time) {
          list.push(item);
        }
      }

      // calculate the sum of deposit and withdraw
      for (let i = 0; i < list.length; i++) {
        const item = list[i];
        if (item.side === "DEPOSIT") {
          // value -= item.amount;
          if (item.trans_status === "COMPLETED") {
            value = value.sub(item.amount);
          }
        } else if (item.side === "WITHDRAW") {
          if (item.trans_status !== "FAILED") {
            value = value.add(item.amount);
          }
        }
      }
    }

    return value.toNumber();
  };

  const calculate = (data: API.DailyRow[], totalValue: number | null) => {
    const lastItem = data[data.length - 1];
    const todayFormattedStr = format(today, "yyyy-MM-dd");

    return {
      ...lastItem,
      date: todayFormattedStr,
      perp_volume: 0,
      account_value:
        totalValue !== null ? totalValue : (lastItem?.account_value ?? 0),
      pnl: calculateLastPnl({ lastItem, assetHistory, totalValue }) ?? 0,
    };
  };

  const mergeData = (
    data: ReadonlyArray<API.DailyRow> | API.DailyRow[],
    totalValue: number | null,
  ) => {
    if (!Array.isArray(data) || data.length === 0) {
      return data;
    }

    const UTCStr = `${today.getUTCFullYear()}-${today.getUTCMonth() + 1}-${today.getUTCDate()}`;

    if (data[data.length - 1].date === UTCStr) {
      return data;
    }

    return data.concat([calculate(data, totalValue)]);
  };

  const calculateData = (
    data: ReadonlyArray<API.DailyRow> | API.DailyRow[],
    realtime: boolean,
  ) => {
    const _data = !realtime ? data : mergeData(data, totalValue);

    return _data.slice(Math.max(0, _data.length - periodValue));
  };

  const calculatedData = useMemo(() => {
    /**
     * need the totalValue and data are all ready, else return null;
     */
    if (totalValue == null) {
      return [];
    }
    return calculateData(data, isRealtime);
  }, [data, totalValue, assetHistory, isRealtime]);

  const aggregateValue = useMemo(() => {
    let vol = zero;
    let pnl = zero;
    let roi = zero;

    if (Array.isArray(calculatedData) && calculatedData.length) {
      calculatedData.forEach((d) => {
        // vol = vol.add(d.perp_volume);
        pnl = pnl.add(d.pnl);
      });

      const tail = calculatedData[0];

      const dataTailIndex = data.findIndex((d) => d.date === tail.date);

      const lastAccountValue = data[dataTailIndex - 1]?.account_value;

      // console.log(data, calculatedData, tail, dataTailIndex);

      if (typeof lastAccountValue === "undefined" || lastAccountValue === 0) {
        roi = zero;
      } else {
        roi = pnl.div(lastAccountValue);
      }
    }

    if (data.length > 0) {
      for (let i = 0; i < periodValue; i++) {
        const item = data[data.length - 1 - i];

        if (item) {
          vol = vol.add(item.perp_volume ?? 0);
        }
      }
    }

    // console.log("---------------------------");

    return { vol: vol.toNumber(), pnl: pnl.toNumber(), roi: roi.toNumber() };
  }, [calculatedData, data, periodValue]);

  const createFakeData = (
    start: Partial<API.DailyRow>,
    end: Partial<API.DailyRow>,
  ) => {
    return Array.from({ length: 2 }, (_, i) => {
      const date = format(i === 0 ? startDate : new Date(), "yyyy-MM-dd");

      return {
        date,
        ...(i === 0 ? start : end),
      };
    });
  };

  return {
    periodTypes,
    period,
    onPeriodChange,
    data: calculatedData,
    aggregateValue,
    createFakeData,
    volumeUpdateDate: data?.[data.length - 1]?.date ?? "",
  } as const;
};

export type useAssetsHistoryDataReturn = ReturnType<
  typeof useAssetsHistoryData
>;
