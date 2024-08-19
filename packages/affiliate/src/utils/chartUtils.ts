import { VolChartDataItem } from "@orderly.network/chart";
import { format, subDays } from "date-fns";

export function fillData(
  days: number,
  origin?: VolChartDataItem[]
): VolChartDataItem[] {
  const now = Date();
  const result: VolChartDataItem[] = new Array(days).fill(0).map(
    (_, index): VolChartDataItem => {
      return {
        date: format(subDays(now, index + 1), "yyyy-MM-dd"),
        volume: 0,
        opacity: 0,
      };
    }
  ).reverse();

  console.log("fill data", result, origin);
  

  const dataObject = origin?.reduce((acc, curr) => {
    acc[curr.date] = curr;
    return acc;
  }, {} as { [key: string]: VolChartDataItem });

  for (let index = 0; index < result.length; index++) {
    const element = result[index];
    const originData = dataObject?.[element.date];
    if (originData) {
      result[index] = { ...originData, opacity: originData.volume > 0 ? 1 : 0 };
    }
  }

  return result;
}
