import { VaultStatus } from "../types/vault";

/**
 * Check if deposit is allowed based on vault status
 * @param status - vault status
 * @returns whether deposit is allowed
 */
export const isDepositAllowed = (status: VaultStatus): boolean => {
  return status === VaultStatus.LIVE;
};

/**
 * Check if withdrawal is allowed based on vault status
 * @param status - vault status
 * @returns whether withdrawal is allowed
 */
export const isWithdrawAllowed = (status: VaultStatus): boolean => {
  return status === VaultStatus.LIVE;
};

/**
 * Check if any operation is allowed based on vault status
 * @param status - vault status
 * @returns whether any operation is allowed
 */
export const isAnyOperationAllowed = (status: VaultStatus): boolean => {
  return status === VaultStatus.LIVE;
};
