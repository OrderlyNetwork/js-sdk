import { i18n } from "@orderly.network/i18n";
import { API } from "@orderly.network/types";

export const getTokenByTokenList = (tokens: API.TokenInfo[] = []) => {
  const tokenObj = tokens.reduce<Record<string, API.TokenInfo>>((acc, item) => {
    acc[item.symbol!] = item;
    return acc;
  }, {});
  return tokenObj["USDC"] || tokenObj["USDbC"] || tokens[0];
};

export const feeDecimalsOffset = (origin?: number): number => {
  return (origin ?? 2) + 3;
};

// export const priceDecimalsOffset = (origin?: number): number => {
//   return Math.abs((origin ?? 2) - 5);
// };

export function checkIsAccountId(accountId: string) {
  const regex = /^0x[a-fA-F0-9]{64}$/;
  return regex.test(accountId);
}

export function getTransferErrorMessage(errorCode: number) {
  if (errorCode === 34) {
    return i18n.t("transfer.internalTransfer.error.transferInProgress");
  }

  if (errorCode === 17) {
    return i18n.t("transfer.internalTransfer.error.withdrawalInProgress");
  }

  if (errorCode === 35) {
    return i18n.t("transfer.internalTransfer.error.accountIdNotExist");
  }

  if (errorCode === 37) {
    return i18n.t("transfer.internalTransfer.error.transferToSelf");
  }

  if (errorCode === 46) {
    return i18n.t("transfer.internalTransfer.error.transferToSubAccount");
  }

  // TODO: when api return 500 status, not throw error code
  // if (errorCode === -1000) {
  //   return i18n.t("transfer.internalTransfer.error.scopeInsufficient");
  // }

  return i18n.t("transfer.internalTransfer.error.default");
}
