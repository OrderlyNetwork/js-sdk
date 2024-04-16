import { Decimal } from "@orderly.network/utils";

export function formatTxID(value?: string) {
  if (value === undefined || value === null) return "";
  if (value.length < 10) return value;
  return `${value.slice(0, 5)}...${value.slice(-5)}`;
}

export function upperFirstLetter(status: string) {
  if (!status) {
    return status;
  }
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

export function generateKeyFun(urlPrefix: string, args: { size?: number }) {
  return (pageIndex: number, previousPageData: any): string | null => {
    // reached the end
    if (previousPageData && !previousPageData.rows?.length) return null;

    const { size = 100 } = args;

    const search = new URLSearchParams([
      ["size", size.toString()],
      ["page", `${pageIndex + 1}`],
    ]);

    return `${urlPrefix}?${search.toString()}`;
  };
}

export function getInfiniteData(data?: any[]) {
  if (!data) {
    return null;
  }

  return data?.map((item) => item.rows)?.flat();
}

/** fundingPeriod default value is 8 */
export function getAnnualRate(fundingRate: number, fundingPeriod: number = 8) {
  const period = new Decimal(24).div(fundingPeriod);

  return new Decimal(fundingRate).mul(period).mul(365).mul(100).toFixed(2);
}
