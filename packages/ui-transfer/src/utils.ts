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

const depositErrorCodeMap = {
  "0x6697b232": "AccessControlBadConfirmation",
  "0xe2517d3f": "AccessControlUnauthorizedAccount",
  "0xc7ee9ce6": "AccountIdInvalid",
  "0x9fabe1c1": "AddressZero",
  "0x4b3815a6": "BalanceNotEnough",
  "0x59d9b863": "BrokerNotAllowed",
  "0xf67c6d78": "CeffuAddressMismatch",
  "0xd969df24": "DepositExceedLimit",
  "0xa65b249b": "EnumerableSetError",
  "0x06a0cf4a": "InvalidSwapSignature",
  "0x1eb00b06": "InvalidTokenAddress",
  "0xfa7c7537": "NativeTokenDepositAmountMismatch",
  "0xad674ae6": "NotRebalanceEnableToken",
  "0x623793c9": "NotZeroCodeLength",
  "0x833d33e7": "OnlyCrossChainManagerCanCall",
  "0x3ee5aeb5": "ReentrancyGuardReentrantCall",
  "0x0b693144": "SwapAlreadySubmitted",
  "0xa29c4986": "TokenNotAllowed",
  "0x30773dbb": "ZeroCodeLength",
  "0x56316e87": "ZeroDeposit",
  "0x93d3bb4d": "ZeroDepositFee",
};

export function getDepositKnownErrorMessage(message: string) {
  if (!message) {
    return "";
  }

  for (const key of Object.keys(depositErrorCodeMap)) {
    if (message.includes(key)) {
      const value =
        depositErrorCodeMap[key as keyof typeof depositErrorCodeMap];
      return `${value} (${key})`;
    }
  }
}
