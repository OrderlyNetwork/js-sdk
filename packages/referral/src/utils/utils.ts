import { toast } from "@orderly.network/react";

export function addQueryParam(
  url: string,
  paramName: string,
  paramValue: string,
): string {
  const urlObj = new URL(url);
  const searchParams = new URLSearchParams(urlObj.search);

  searchParams.set(paramName, paramValue);

  urlObj.search = searchParams.toString();

  return urlObj.toString();
}

export async function copyText(content: string) {
  try {
    await navigator.clipboard.writeText(content);
    toast.success("Copy success");
  } catch (error) {
    toast.success("Copy failed");
  }
}

export function parseTime(time?: number | string): Date | null {
  if (!time) return null;
  const timestamp = typeof time === "number" ? time : Date.parse(time);

  if (!isNaN(timestamp)) {
    return new Date(timestamp);
  }

  return null;
}

//** will be return YYYY-MM-ddThh:mm:ssZ */
export function formatTime(time?: number | string): string | undefined {
  const date = parseTime(time);
  if (!date) return undefined;
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");

  const formattedTime = `${year}-${month}-${day} ${hours}:${minutes} UTC`;
  return formattedTime;
}

//** will return yyyy-MM-dd */
export function formatYMDTime(time?: number | string): string | undefined {
  const date = parseTime(time);
  if (!date) return undefined;
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  const formattedTime = `${year}-${month}-${day}`;
  return formattedTime;
}

//** will return hh:mm */
export function formatHMTime(time?: number | string): string | undefined {
  const date = parseTime(time);
  if (!date) {
    return undefined;
  }
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");

  const formattedTime = `${hours}:${minutes}`;
  return formattedTime;
}

//** will return MM:dd */
export function formatMdTime(time?: number | string): string | undefined {
  const date = parseTime(time);
  if (!date) {
    return undefined;
  }
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  const formattedTime = `${month}-${day}`;
  return formattedTime;
}

//** compare two date, yyyy-mm-dd */
export function compareDate(d1?: Date, d2?: Date) {
  const isEqual =
    d1 &&
    d2 &&
    d1.toISOString().substring(0, 10) === d2.toISOString().substring(0, 10);

  return isEqual;
}

export function generateData(
  itemCount: number,
  data: any[] | ReadonlyArray<any> | null | undefined,
  timeKey: string,
  valueKey: string,
): [string, number][] {
  const result: [string, number][] = [];

  for (let i = 0; i < itemCount; i++) {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - i - 1);
    const currentDateStr = currentDate.toISOString().substring(0, 10);

    const matchedData = data?.find((item) => {
      const itemDate = parseTime(item[timeKey]);
      if (!itemDate) {
        return false;
      }
      return itemDate.toISOString().substring(0, 10) === currentDateStr;
    });

    if (matchedData) {
      result.push([currentDateStr, matchedData[valueKey]]);
    } else {
      result.push([currentDateStr, 0]);
    }
  }

  return result.reverse();
}
