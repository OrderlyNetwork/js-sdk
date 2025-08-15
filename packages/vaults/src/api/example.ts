/**
 * Example usage of the optimized request client
 * This file demonstrates various usage patterns and best practices
 */
import { useSVApiUrl } from "../hooks/useSVApiUrl";
import {
  getVaultInfo,
  getVaultLpPerformance,
  getVaultLpInfo,
  type VaultPerformanceParams,
  type VaultLpInfoParams,
} from "./api";
import client, { RequestClient, VaultsApiError } from "./request";

// Example data types
interface VaultData {
  id: string;
  name: string;
  balance: number;
  apy: number;
}

interface CreateVaultRequest {
  name: string;
  initialDeposit: number;
}

/**
 * Example 1: Basic GET request using the simplified API
 */
export async function fetchVaultById(id: string): Promise<VaultData> {
  try {
    return await client.get<VaultData>(`/api/vaults/${id}`);
  } catch (error) {
    if (error instanceof VaultsApiError) {
      console.error("Failed to fetch vault:", error.message, error.code);
    }
    throw error;
  }
}

/**
 * Example 1.5: GET request with query parameters (simplified)
 */
export async function fetchVaultsWithFilters(filters: {
  status?: "active" | "inactive";
  minBalance?: number;
  maxBalance?: number;
  sortBy?: string;
  limit?: number;
  offset?: number;
}): Promise<VaultData[]> {
  try {
    // Single config object with query parameters
    return await client.get<VaultData[]>("/api/vaults", {
      params: {
        status: filters.status,
        min_balance: filters.minBalance,
        max_balance: filters.maxBalance,
        sort_by: filters.sortBy,
        limit: filters.limit,
        offset: filters.offset,
        // This undefined value will be automatically removed
        unused_param: undefined,
      },
    });
  } catch (error) {
    if (error instanceof VaultsApiError) {
      console.error("Failed to fetch filtered vaults:", error.message);
    }
    throw error;
  }
}

/**
 * Example 2: POST request with data (simplified)
 */
export async function createVault(
  vaultData: CreateVaultRequest,
): Promise<VaultData> {
  return client.post<VaultData>("/api/vaults", {
    data: vaultData,
    timeout: 15000, // Longer timeout for creation operations
    retry: 1, // Only retry once for mutations
  });
}

/**
 * Example 3: Custom client with authentication
 */
export function createAuthenticatedClient(token: string): RequestClient {
  const authClient = new RequestClient();

  // Add authentication interceptor
  authClient.addRequestInterceptor(async (config) => {
    return {
      ...config,
      headers: {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      },
    };
  });

  // Add response logging
  authClient.addResponseInterceptor(async (response, data) => {
    // Log API responses for debugging purposes in development mode only
    if (process.env.NODE_ENV === "development") {
      // Using console.warn as it's allowed by the linter
      console.warn(`API Response [${response.status}]:`, response.url);
    }
    return data;
  });

  return authClient;
}

/**
 * Example 4: Using with environment-specific API URLs
 */
export function useVaultOperations() {
  const apiUrl = useSVApiUrl();

  const fetchAllVaults = async (filters?: {
    page?: number;
    pageSize?: number;
    status?: string;
  }): Promise<VaultData[]> => {
    // Simplified single config object
    return client.get<VaultData[]>("/api/vaults", {
      baseURL: apiUrl,
      timeout: 10000,
      params: {
        page: filters?.page,
        page_size: filters?.pageSize,
        status: filters?.status,
      },
    });
  };

  const updateVault = async (
    id: string,
    updates: Partial<VaultData>,
  ): Promise<VaultData> => {
    return client.put<VaultData>(`/api/vaults/${id}`, {
      data: updates,
      baseURL: apiUrl,
    });
  };

  const deleteVault = async (id: string): Promise<void> => {
    return client.delete(`/api/vaults/${id}`, {
      baseURL: apiUrl,
    });
  };

  return {
    fetchAllVaults,
    updateVault,
    deleteVault,
  };
}

/**
 * Example 5: Advanced error handling with retry logic
 */
export async function fetchVaultWithRetry(
  id: string,
): Promise<VaultData | null> {
  try {
    return await client.get<VaultData>(`/api/vaults/${id}`, {
      retry: 3,
      retryDelay: 2000,
      validateStatus: (status) => {
        // Accept 200-299 and 404 (vault not found)
        return (status >= 200 && status < 300) || status === 404;
      },
    });
  } catch (error) {
    if (error instanceof VaultsApiError && error.status === 404) {
      // Vault not found, return null instead of throwing
      return null;
    }
    throw error;
  }
}

/**
 * Example 6: Bulk operations with concurrent requests
 */
export async function fetchMultipleVaults(ids: string[]): Promise<VaultData[]> {
  const requests = ids.map((id) =>
    fetchVaultById(id).catch((error) => {
      console.warn(`Failed to fetch vault ${id}:`, error.message);
      return null; // Return null for failed requests
    }),
  );

  const results = await Promise.all(requests);

  // Filter out null results (failed requests)
  return results.filter((vault): vault is VaultData => vault !== null);
}

/**
 * Example 7: Request with custom validation
 */
export async function fetchVaultMetrics(id: string) {
  return client.get(`/api/vaults/${id}/metrics`, {
    timeout: 5000,
    validateStatus: (status) => {
      // Accept any 2xx status and 304 (not modified)
      return (status >= 200 && status < 300) || status === 304;
    },
  });
}

/**
 * Example 8: Upload with different content type
 */
export async function uploadVaultDocument(
  vaultId: string,
  file: File,
): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);

  return client.post(`/api/vaults/${vaultId}/documents`, {
    body: formData, // Use body directly for FormData
    // Don't set Content-Type header - let browser set it with boundary
    headers: {},
    timeout: 30000, // Longer timeout for file uploads
  });
}

/**
 * Example 9: Using the new Vaults API with individual functions
 */
export function useVaultsApi() {
  const apiUrl = useSVApiUrl();

  // Get all vault information
  const fetchVaultInfo = async () => {
    try {
      const response = await getVaultInfo(apiUrl);
      // Successfully fetched vault info
      return response.rows;
    } catch (error) {
      console.error("Failed to fetch vault info:", error);
      throw error;
    }
  };

  // Get vault LP performance data
  const fetchVaultPerformance = async (params: VaultPerformanceParams) => {
    try {
      const response = await getVaultLpPerformance(apiUrl, params);
      // Successfully fetched vault performance data
      return response.rows;
    } catch (error) {
      console.error("Failed to fetch vault performance:", error);
      throw error;
    }
  };

  // Get vault LP information
  const fetchVaultLpInfo = async (params: VaultLpInfoParams) => {
    try {
      const response = await getVaultLpInfo(apiUrl, params);
      // Successfully fetched vault LP info
      return response.rows;
    } catch (error) {
      console.error("Failed to fetch vault LP info:", error);
      throw error;
    }
  };

  return {
    fetchVaultInfo,
    fetchVaultPerformance,
    fetchVaultLpInfo,
  };
}

/**
 * Example 9.5: Advanced query parameters usage examples
 */
export function useQueryParametersExamples() {
  const apiUrl = useSVApiUrl();

  // Example with mixed parameter types
  const searchVaults = async (searchParams: {
    query?: string;
    minApy?: number;
    maxApy?: number;
    isActive?: boolean;
    tags?: string[];
    page?: number;
    limit?: number;
  }) => {
    return client.get<VaultData[]>("/api/vaults/search", {
      baseURL: apiUrl,
      timeout: 8000,
      params: {
        q: searchParams.query,
        min_apy: searchParams.minApy,
        max_apy: searchParams.maxApy,
        active: searchParams.isActive,
        // Arrays will be converted to strings automatically
        tags: searchParams.tags?.join(","),
        page: searchParams.page,
        limit: searchParams.limit,
        // These undefined values will be filtered out automatically
        unused1: undefined,
        unused2: null,
      },
    });
  };

  // Example using the alternative syntax (params in config)
  const getVaultHistory = async (
    vaultId: string,
    options?: {
      startDate?: string;
      endDate?: string;
      granularity?: "hour" | "day" | "week";
    },
  ) => {
    return client.get<unknown[]>(`/api/vaults/${vaultId}/history`, {
      baseURL: apiUrl,
      params: {
        start_date: options?.startDate,
        end_date: options?.endDate,
        granularity: options?.granularity,
      },
    });
  };

  return {
    searchVaults,
    getVaultHistory,
  };
}

/**
 * Example 10: Complete vault data fetching workflow using individual functions
 */
export async function fetchCompleteVaultData(
  vaultId: string,
  walletAddress: string,
  apiUrl: string,
) {
  try {
    // Fetch all vault information in parallel
    const [vaultInfoResponse, performanceResponse, lpInfoResponse] =
      await Promise.all([
        getVaultInfo(apiUrl),
        getVaultLpPerformance(apiUrl, {
          vault_id: vaultId,
          time_range: "30d",
        }),
        getVaultLpInfo(apiUrl, {
          vault_id: vaultId,
          wallet_address: walletAddress,
        }),
      ]);

    // Find the specific vault from the list
    const specificVault = vaultInfoResponse.rows.find(
      (vault) => vault.vault_id === vaultId,
    );

    return {
      vaultInfo: specificVault,
      allVaults: vaultInfoResponse.rows,
      performance: performanceResponse.rows,
      lpInfo: lpInfoResponse.rows,
    };
  } catch (error) {
    console.error("Failed to fetch complete vault data:", error);
    throw error;
  }
}
