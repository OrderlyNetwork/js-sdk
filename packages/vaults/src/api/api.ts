import type {
  VaultInfo,
  VaultLpPerformance,
  VaultLpInfo,
  VaultTimeRange,
} from "../types/vault";
import requestClient from "./request";

// API response wrapper interfaces
interface VaultInfoResponse {
  rows: VaultInfo[];
}

interface VaultLpPerformanceResponse {
  rows: VaultLpPerformance[];
}

interface VaultLpInfoResponse {
  rows: VaultLpInfo[];
}

// API parameters interfaces
interface VaultPerformanceParams {
  vault_id: string;
  time_range?: VaultTimeRange;
}

interface VaultLpInfoParams {
  vault_id: string;
  wallet_address: string;
}

interface VaultOperationMessage {
  payloadType: string;
  nonce: string;
  receiver: string;
  amount: string;
  vaultId: string;
  token: string;
  dexBrokerId: string;
  chainId?: string;
  chainType?: string;
}

type VaultOperationRequest = {
  message: VaultOperationMessage;
  signature: string;
  userAddress: string;
  verifyingContract: string;
};

/**
 * Get vault information
 * @param baseUrl - The base URL for the API endpoints
 * @returns Promise<VaultInfoResponse> - Array of vault information
 */
export async function getVaultInfo(
  baseUrl: string,
): Promise<VaultInfoResponse> {
  return requestClient.get<VaultInfoResponse>(
    "/v1/public/strategy_vault/vault/info",
    {
      baseURL: baseUrl,
    },
  );
}

/**
 * Get vault LP performance data
 * @param baseUrl - The base URL for the API endpoints
 * @param params - Parameters including vault_id and time_range
 * @returns Promise<VaultLpPerformanceResponse> - Array of vault LP performance data
 */
export async function getVaultLpPerformance(
  baseUrl: string,
  params: VaultPerformanceParams,
): Promise<VaultLpPerformanceResponse> {
  return requestClient.get<VaultLpPerformanceResponse>(
    "/v1/public/strategy_vault/vault/performance",
    {
      params,
      baseURL: baseUrl,
    },
  );
}

/**
 * Get vault LP information
 * @param baseUrl - The base URL for the API endpoints
 * @param params - Parameters including vault_id and wallet_address
 * @returns Promise<VaultLpInfoResponse> - Array of vault LP information
 */
export async function getVaultLpInfo(
  baseUrl: string,
  params: VaultLpInfoParams,
): Promise<VaultLpInfoResponse> {
  return requestClient.get<VaultLpInfoResponse>(
    "/v1/public/strategy_vault/lp/info",
    {
      params,
      baseURL: baseUrl,
    },
  );
}

// export async function getVaultNonce(
//   baseUrl: string,
// ) {
//   return requestClient.get(
//     '/v1/public/sv_nonce',
//     {
//       baseURL: baseUrl,
//     }
//   );
// }

// export async function postVaultOperation(
//   baseUrl: string,
//   data: VaultOperationRequest
// ) {
//   return requestClient.post(
//     '/v1/public/sv_operation',
//     {
//       baseURL: baseUrl,
//       data,
//     }
//   );
// }

// Export types for external usage
export type {
  VaultInfoResponse,
  VaultLpPerformanceResponse,
  VaultLpInfoResponse,
  VaultPerformanceParams,
  VaultLpInfoParams,
  VaultOperationRequest,
  VaultOperationMessage,
};
