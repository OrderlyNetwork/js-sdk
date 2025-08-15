import { create } from "zustand";
import {
  getVaultInfo,
  getVaultLpPerformance,
  getVaultLpInfo,
} from "../api/api";
import type {
  VaultInfoResponse,
  VaultLpPerformanceResponse,
  VaultLpInfoResponse,
  VaultPerformanceParams,
  VaultLpInfoParams,
} from "../api/api";
import type {
  VaultInfo,
  VaultLpPerformance,
  VaultLpInfo,
} from "../types/vault";

// Store state interface
interface VaultsState {
  // Base URL for API requests
  baseUrl: string;

  // Vault info state
  vaultInfo: {
    data: VaultInfo[];
    loading: boolean;
    error: string | null;
    lastUpdated: number | null;
  };

  // Vault LP performance state
  vaultLpPerformance: {
    data: Record<string, VaultLpPerformance[]>;
    loading: boolean;
    error: string | null;
    lastUpdated: number | null;
    params: VaultPerformanceParams | null;
  };

  // Vault LP info state
  vaultLpInfo: {
    data: Record<string, VaultLpInfo[]>;
    loading: boolean;
    error: string | null;
    lastUpdated: number | null;
    params: VaultLpInfoParams | null;
  };

  // Actions
  setBaseUrl: (baseUrl: string) => void;
  fetchVaultInfo: (baseUrl?: string) => Promise<void>;
  refreshVaultInfo: () => Promise<void>;

  fetchVaultLpPerformance: (
    params: VaultPerformanceParams,
    baseUrl?: string,
  ) => Promise<void>;
  refreshVaultLpPerformance: () => Promise<void>;

  fetchVaultLpInfo: (
    params: VaultLpInfoParams,
    baseUrl?: string,
  ) => Promise<void>;
  refreshVaultLpInfo: () => Promise<void>;
}

// Create the store
export const useVaultsStore = create<VaultsState>((set, get) => ({
  // Initial state
  baseUrl: "",

  vaultInfo: {
    data: [],
    loading: false,
    error: null,
    lastUpdated: null,
  },

  vaultLpPerformance: {
    data: {},
    loading: false,
    error: null,
    lastUpdated: null,
    params: null,
  },

  vaultLpInfo: {
    data: {},
    loading: false,
    error: null,
    lastUpdated: null,
    params: null,
  },

  // Set base URL
  setBaseUrl: (baseUrl: string) => {
    set({ baseUrl });
  },

  // Vault info actions
  fetchVaultInfo: async (baseUrl?: string) => {
    const state = get();
    const url = baseUrl || state.baseUrl;

    if (!url) {
      set((state) => ({
        vaultInfo: {
          ...state.vaultInfo,
          error: "Base URL is required",
        },
      }));
      return;
    }

    set((state) => ({
      baseUrl: baseUrl || state.baseUrl,
      vaultInfo: {
        ...state.vaultInfo,
        loading: true,
        error: null,
      },
    }));

    try {
      const response: VaultInfoResponse = await getVaultInfo(url);
      set((state) => ({
        vaultInfo: {
          ...state.vaultInfo,
          data: response.rows,
          loading: false,
          error: null,
          lastUpdated: Date.now(),
        },
      }));
    } catch (error) {
      set((state) => ({
        vaultInfo: {
          ...state.vaultInfo,
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch vault info",
        },
      }));
    }
  },

  refreshVaultInfo: async () => {
    const state = get();
    // Only refresh if we have previously fetched data and have baseUrl
    if (state.vaultInfo.lastUpdated && state.baseUrl) {
      await state.fetchVaultInfo();
    }
  },

  // Vault LP performance actions
  fetchVaultLpPerformance: async (
    params: VaultPerformanceParams,
    baseUrl?: string,
  ) => {
    const state = get();
    const url = baseUrl || state.baseUrl;

    if (!url) {
      set((state) => ({
        vaultLpPerformance: {
          ...state.vaultLpPerformance,
          error: "Base URL is required",
        },
      }));
      return;
    }

    set((state) => ({
      baseUrl: baseUrl || state.baseUrl,
      vaultLpPerformance: {
        ...state.vaultLpPerformance,
        loading: true,
        error: null,
        params,
      },
    }));

    try {
      const response: VaultLpPerformanceResponse = await getVaultLpPerformance(
        url,
        params,
      );

      // Store the rows array with vault_id as key
      set((state) => ({
        vaultLpPerformance: {
          ...state.vaultLpPerformance,
          data: {
            ...state.vaultLpPerformance.data,
            [params.vault_id]: response.rows,
          },
          loading: false,
          error: null,
          lastUpdated: Date.now(),
        },
      }));
    } catch (error) {
      set((state) => ({
        vaultLpPerformance: {
          ...state.vaultLpPerformance,
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch vault LP performance",
        },
      }));
    }
  },

  refreshVaultLpPerformance: async () => {
    const state = get();
    // Only refresh if we have previously fetched data, have params, and have baseUrl
    if (
      state.vaultLpPerformance.lastUpdated &&
      state.vaultLpPerformance.params &&
      state.baseUrl
    ) {
      await state.fetchVaultLpPerformance(state.vaultLpPerformance.params);
    }
  },

  // Vault LP info actions
  fetchVaultLpInfo: async (params: VaultLpInfoParams, baseUrl?: string) => {
    const state = get();
    const url = baseUrl || state.baseUrl;

    if (!url) {
      set((state) => ({
        vaultLpInfo: {
          ...state.vaultLpInfo,
          error: "Base URL is required",
        },
      }));
      return;
    }

    set((state) => ({
      baseUrl: baseUrl || state.baseUrl,
      vaultLpInfo: {
        ...state.vaultLpInfo,
        loading: true,
        error: null,
        params,
      },
    }));

    try {
      const response: VaultLpInfoResponse = await getVaultLpInfo(url, params);

      // Store the rows array with vault_id as key
      set((state) => ({
        vaultLpInfo: {
          ...state.vaultLpInfo,
          data: {
            ...state.vaultLpInfo.data,
            [params.vault_id]: response.rows,
          },
          loading: false,
          error: null,
          lastUpdated: Date.now(),
        },
      }));
    } catch (error) {
      set((state) => ({
        vaultLpInfo: {
          ...state.vaultLpInfo,
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch vault LP info",
        },
      }));
    }
  },

  refreshVaultLpInfo: async () => {
    const state = get();
    // Only refresh if we have previously fetched data, have params, and have baseUrl
    if (
      state.vaultLpInfo.lastUpdated &&
      state.vaultLpInfo.params &&
      state.baseUrl
    ) {
      await state.fetchVaultLpInfo(state.vaultLpInfo.params);
    }
  },
}));

// Selector hooks for easier access to specific parts of the state
export const useVaultInfoState = () =>
  useVaultsStore((state) => state.vaultInfo);
export const useVaultLpPerformanceState = () =>
  useVaultsStore((state) => state.vaultLpPerformance);
export const useVaultLpInfoState = () =>
  useVaultsStore((state) => state.vaultLpInfo);

// Action hooks for easier access to actions
export const useVaultInfoActions = () =>
  useVaultsStore((state) => ({
    fetchVaultInfo: state.fetchVaultInfo,
    refreshVaultInfo: state.refreshVaultInfo,
  }));

export const useVaultLpPerformanceActions = () =>
  useVaultsStore((state) => ({
    fetchVaultLpPerformance: state.fetchVaultLpPerformance,
    refreshVaultLpPerformance: state.refreshVaultLpPerformance,
  }));

export const useVaultLpInfoActions = () =>
  useVaultsStore((state) => ({
    fetchVaultLpInfo: state.fetchVaultLpInfo,
    refreshVaultLpInfo: state.refreshVaultLpInfo,
  }));

// Selector hooks for accessing data by vault_id
export const useVaultLpPerformanceById = (vaultId: string) =>
  useVaultsStore((state) => state.vaultLpPerformance.data[vaultId]);

export const useVaultLpInfoById = (vaultId: string) =>
  useVaultsStore((state) => state.vaultLpInfo.data[vaultId]);

// Selector hooks for getting all vault_ids that have data
export const useVaultLpPerformanceIds = () =>
  useVaultsStore((state) => Object.keys(state.vaultLpPerformance.data));

export const useVaultLpInfoIds = () =>
  useVaultsStore((state) => Object.keys(state.vaultLpInfo.data));

// Selector hooks for getting all data as flat arrays (for backward compatibility)
export const useVaultLpPerformanceArray = () =>
  useVaultsStore((state) =>
    Object.values(state.vaultLpPerformance.data).flat(),
  );

export const useVaultLpInfoArray = () =>
  useVaultsStore((state) => Object.values(state.vaultLpInfo.data).flat());
