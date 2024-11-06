/*
{
      message: "I am the Orderly KING.",
      domain: "ordely.network",
      updateTime: "2022-JAN-01 23:23",
      position: {
        symbol: "BTC-PERP",
        currency: "USDC",
        side: "LONG",
        leverage: 20,
        pnl: 10432.23,
        ROI: 20.25,
        informations: [
          { title: "Open Price", value: 0.12313 },
          { title: "Opened at", value: "Jan-01 23:23" },
          { title: "Mark price", value: "0.12341" },
          { title: "Quantity", value: "0.123" },
        ],
      },
      referral: {
        code: "WRECKED",
        link: "https://orderly.network",
        slogan: "Try Orderly now with:",
      }
    }
*/

import { Decimal } from "@orderly.network/utils";
import { PnLDisplayFormat, ShareOptions } from "../../types/types";
// import { PnLDisplayFormat, ShareOptions } from "./type";

export type ReferralType = {
  code?: string;
  link?: string;
  slogan?: string;
};

export function getPnLPosterData(
  position: any,
  leverage: number | string,
  message: string,
  domain: string,
  pnlType: PnLDisplayFormat,
  options: Set<ShareOptions>,
  baseDp?: number,
  quoteDp?: number,
  referral?: ReferralType
) {
  const { symbol, currency } = processSymbol(position.symbol);
  const positionData: any = {
    symbol,
    currency,
    side: position.position_qty > 0 ? "LONG" : "SHORT",
  };

  switch (pnlType) {
    case "pnl": {
      if ("unrealized_pnl" in position) {
        positionData["pnl"] = new Decimal(position.unrealized_pnl).toFixed(
          2,
          Decimal.ROUND_DOWN
        );
      }
      break;
    }
    case "roi": {
      if ("unrealized_pnl_ROI" in position) {
        positionData["ROI"] = new Decimal(
          position.unrealized_pnl_ROI * 100
        ).toFixed(2, Decimal.ROUND_DOWN);
      }
      break;
    }
    case "roi_pnl": {
      if ("unrealized_pnl" in position) {
        positionData["pnl"] = new Decimal(position.unrealized_pnl).toFixed(
          2,
          Decimal.ROUND_DOWN
        );
      }
      if ("unrealized_pnl_ROI" in position) {
        positionData["ROI"] = new Decimal(
          position.unrealized_pnl_ROI * 100
        ).toFixed(2, Decimal.ROUND_DOWN);
      }
      break;
    }
  }

  const informations: { title: string; value: any }[] = [];

  if (options.has("leverage")) {
    positionData["leverage"] = leverage;
  }
  const array: ShareOptions[] = [
    "openPrice",
    "openTime",
    "markPrice",
    "quantity",
  ];
  array.forEach((key) => {
    if (options.has(key)) {
      switch (key) {
        case "leverage": {
          break;
        }
        case "openPrice": {
          informations.push({
            title: "Open price",
            value: formatFixed(position.average_open_price, quoteDp || 2),
          });
          break;
        }
        case "openTime": {
          informations.push({
            title: "Opened at",
            value: formatOpenTime(position.timestamp),
          });
          break;
        }
        case "markPrice": {
          informations.push({
            title: "Mark price",
            value: formatFixed(position.mark_price, quoteDp || 2),
          });
          break;
        }
        case "quantity": {
          informations.push({
            title: "Quantity",
            value: formatFixed(position.position_qty, baseDp || 2),
          });
        }
        default:
          break;
      }
    }
  });

  positionData["informations"] = informations;

  const data: any = {
    position: positionData,
    updateTime: formatShareTime(new Date()),
    domain,
  };
  if (message.length > 0) {
    data["message"] = message;
  }

  if (typeof referral !== "undefined" && referral["code"] !== undefined) {
    data["referral"] = referral;
  }

  return data;
}

interface SymbolResult {
  symbol: string;
  currency: string;
}

function processSymbol(symbol: string): SymbolResult {
  const tokens = symbol.split("_");
  if (tokens.length !== 3) {
    return {
      symbol: symbol,
      currency: "USDC",
    };
  }

  const [symbol1, symbol2, symbol3] = tokens;
  const formattedString = `${symbol2}-${symbol1}`;

  return {
    symbol: formattedString,
    currency: symbol3 || "USDC",
  };
}

function formatShareTime(input: number): string;
function formatShareTime(input: Date): string;
function formatShareTime(input: number | Date): string {
  const date = input instanceof Date ? input : new Date(input);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h24",
  };

  const formatter = new Intl.DateTimeFormat("en-US", options);
  const formattedParts = formatter.formatToParts(date);

  // console.log("formattedParts", formattedParts);

  const year = formattedParts.find((part) =>
    part.type === "year" ? part.value : ""
  )?.value;
  const month = formattedParts.find((part) =>
    part.type === "month" ? part.value : ""
  )?.value;
  const day = formattedParts.find((part) =>
    part.type === "day" ? part.value : ""
  )?.value;
  const hour = formattedParts.find((part) =>
    part.type === "hour" ? part.value : ""
  )?.value;
  const minute = formattedParts.find((part) =>
    part.type === "minute" ? part.value : ""
  )?.value;

  return `${year}-${month}-${day} ${hour}:${minute}`;
}

function formatOpenTime(input: number | Date): string {
  const date = input instanceof Date ? input : new Date(input);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  };

  const formatter = new Intl.DateTimeFormat("en-US", options);
  const formattedParts = formatter.formatToParts(date);

  // console.log("formattedParts", formattedParts);

  const month = formattedParts.find((part) =>
    part.type === "month" ? part.value : ""
  )?.value;
  const day = formattedParts.find((part) =>
    part.type === "day" ? part.value : ""
  )?.value;
  const hour = formattedParts.find((part) =>
    part.type === "hour" ? part.value : ""
  )?.value;
  const minute = formattedParts.find((part) =>
    part.type === "minute" ? part.value : ""
  )?.value;

  return `${month}-${day} ${hour}:${minute}`;
}

function formatFixed(value: number, dp: number) {
  return new Decimal(value).toFixed(dp, Decimal.ROUND_DOWN);
}

export function savePnlInfo(
  format: PnLDisplayFormat,
  options: Set<ShareOptions>,
  bgIndex: number,
  message: string
) {
  localStorage.setItem(
    "pnl_config_key",
    JSON.stringify({
      bgIndex: bgIndex,
      pnlFormat: format,
      options: Array.from(options),
      message: message,
    })
  );
}

export function getPnlInfo(): {
  bgIndex: number;
  pnlFormat: PnLDisplayFormat;
  options: ShareOptions[];
  message: "";
} {
  const str = localStorage.getItem("pnl_config_key");

  if (str && str.length > 0) {
    try {
      const json = JSON.parse(str);

      return json;
    } catch (e) {}
  }
  return {
    bgIndex: 0,
    pnlFormat: "roi_pnl",
    options: ["openPrice", "openTime", "markPrice", "quantity", "leverage"],
    message: "",
  };
}
