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
        date: format(subDays(now, index), "yyyy-MM-dd"),
        volume: 0,
        opacity: 0,
      };
    }
  ).reverse();
  console.log("days", days, origin, result);

  const dataObject = origin?.reduce((acc, curr) => {
    acc[curr.date] = curr;
    return acc;
  }, {} as { [key: string]: VolChartDataItem });

  for (let index = 0; index < result.length; index++) {
    const element = result[index];
    if (dataObject?.[element.date]) {
      result[index] = { ...dataObject[element.date] };
    }
  }

  return result;
}
