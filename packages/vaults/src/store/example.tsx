import React, { useEffect } from "react";
import {
  useVaultsStore,
  useVaultInfoState,
  useVaultLpPerformanceState,
  useVaultLpInfoState,
  useVaultInfoActions,
  useVaultLpPerformanceActions,
  useVaultLpInfoActions,
} from "./vaultsStore";

/**
 * Example component showing how to use the Vaults Store
 */
export const VaultsStoreExample: React.FC = () => {
  // Get state from store
  const vaultInfoState = useVaultInfoState();
  const vaultLpPerformanceState = useVaultLpPerformanceState();
  const vaultLpInfoState = useVaultLpInfoState();

  // Get actions from store
  const { fetchVaultInfo, refreshVaultInfo } = useVaultInfoActions();
  const { fetchVaultLpPerformance, refreshVaultLpPerformance } =
    useVaultLpPerformanceActions();
  const { fetchVaultLpInfo, refreshVaultLpInfo } = useVaultLpInfoActions();

  // Get store methods directly
  const setBaseUrl = useVaultsStore((state) => state.setBaseUrl);

  useEffect(() => {
    // Set base URL on component mount
    setBaseUrl("https://your-api-base-url.com");

    // Fetch initial data
    const initializeData = async () => {
      try {
        // Fetch vault info
        await fetchVaultInfo();

        // Fetch LP performance data for a specific vault
        await fetchVaultLpPerformance({
          vault_id: "vault123",
          time_range: "30d",
        });

        // Fetch LP info for a specific vault and wallet
        await fetchVaultLpInfo({
          vault_id: "vault123",
          wallet_address: "0x1234567890123456789012345678901234567890",
        });
      } catch (error) {
        console.error("Failed to initialize vault data:", error);
      }
    };

    initializeData();
  }, [fetchVaultInfo, fetchVaultLpPerformance, fetchVaultLpInfo, setBaseUrl]);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Vaults Store Example</h1>

      {/* Vault Info Section */}
      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Vault Information</h2>
          <button
            onClick={refreshVaultInfo}
            disabled={vaultInfoState.loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {vaultInfoState.loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {vaultInfoState.loading && <div>Loading vault info...</div>}
        {vaultInfoState.error && (
          <div className="text-red-500">Error: {vaultInfoState.error}</div>
        )}
        {vaultInfoState.data.length > 0 && (
          <div>
            <p>Found {vaultInfoState.data.length} vaults</p>
            <div className="mt-2 space-y-1">
              {vaultInfoState.data.slice(0, 3).map((vault) => (
                <div key={vault.vault_id} className="text-sm">
                  {vault.vault_id} - TVL: ${vault.tvl.toLocaleString()}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Vault LP Performance Section */}
      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">LP Performance</h2>
          <button
            onClick={refreshVaultLpPerformance}
            disabled={vaultLpPerformanceState.loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {vaultLpPerformanceState.loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {vaultLpPerformanceState.loading && (
          <div>Loading performance data...</div>
        )}
        {vaultLpPerformanceState.error && (
          <div className="text-red-500">
            Error: {vaultLpPerformanceState.error}
          </div>
        )}
        {vaultLpPerformanceState.data.length > 0 && (
          <div>
            <p>
              Performance data for {vaultLpPerformanceState.params?.vault_id}
            </p>
            <div className="mt-2 space-y-1">
              {vaultLpPerformanceState.data.map((perf, index) => (
                <div key={index} className="text-sm">
                  {perf.time_range}: PnL {perf.incremental_net_pnl}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Vault LP Info Section */}
      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">LP Information</h2>
          <button
            onClick={refreshVaultLpInfo}
            disabled={vaultLpInfoState.loading}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
          >
            {vaultLpInfoState.loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {vaultLpInfoState.loading && <div>Loading LP info...</div>}
        {vaultLpInfoState.error && (
          <div className="text-red-500">Error: {vaultLpInfoState.error}</div>
        )}
        {vaultLpInfoState.data.length > 0 && (
          <div>
            <p>LP info for {vaultLpInfoState.params?.vault_id}</p>
            <div className="mt-2 space-y-1">
              {vaultLpInfoState.data.map((lpInfo, index) => (
                <div key={index} className="text-sm">
                  Vault: {lpInfo.vault_id} - NAV: {lpInfo.lp_nav}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Manual Fetch Example */}
      <div className="border rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Manual Fetch Examples</h2>
        <div className="space-x-2">
          <button
            onClick={() => fetchVaultInfo("https://custom-api-url.com")}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Fetch with Custom URL
          </button>
          <button
            onClick={() =>
              fetchVaultLpPerformance({
                vault_id: "vault456",
                time_range: "7d",
              })
            }
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Fetch Different Vault Performance
          </button>
          <button
            onClick={() =>
              fetchVaultLpInfo({
                vault_id: "vault456",
                wallet_address: "0x0987654321098765432109876543210987654321",
              })
            }
            className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
          >
            Fetch Different LP Info
          </button>
        </div>
      </div>

      {/* Store Debug Info */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h3 className="text-lg font-semibold mb-2">Store Debug Info</h3>
        <div className="text-xs space-y-1">
          <div>
            Vault Info Last Updated:{" "}
            {vaultInfoState.lastUpdated
              ? new Date(vaultInfoState.lastUpdated).toLocaleString()
              : "Never"}
          </div>
          <div>
            LP Performance Last Updated:{" "}
            {vaultLpPerformanceState.lastUpdated
              ? new Date(vaultLpPerformanceState.lastUpdated).toLocaleString()
              : "Never"}
          </div>
          <div>
            LP Info Last Updated:{" "}
            {vaultLpInfoState.lastUpdated
              ? new Date(vaultLpInfoState.lastUpdated).toLocaleString()
              : "Never"}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Hook example showing how to use the store in a custom hook
 */
export const useVaultData = (vaultId: string, walletAddress: string) => {
  const { fetchVaultInfo, fetchVaultLpPerformance, fetchVaultLpInfo } =
    useVaultsStore();
  const setBaseUrl = useVaultsStore((state) => state.setBaseUrl);

  const vaultInfoState = useVaultInfoState();
  const vaultLpPerformanceState = useVaultLpPerformanceState();
  const vaultLpInfoState = useVaultLpInfoState();

  const initializeVaultData = async (baseUrl: string) => {
    setBaseUrl(baseUrl);

    await Promise.all([
      fetchVaultInfo(),
      fetchVaultLpPerformance({
        vault_id: vaultId,
        time_range: "30d",
      }),
      fetchVaultLpInfo({
        vault_id: vaultId,
        wallet_address: walletAddress,
      }),
    ]);
  };

  const refreshAllData = async () => {
    const { refreshVaultInfo, refreshVaultLpPerformance, refreshVaultLpInfo } =
      useVaultsStore.getState();

    await Promise.all([
      refreshVaultInfo(),
      refreshVaultLpPerformance(),
      refreshVaultLpInfo(),
    ]);
  };

  return {
    vaultInfoState,
    vaultLpPerformanceState,
    vaultLpInfoState,
    initializeVaultData,
    refreshAllData,
    isLoading:
      vaultInfoState.loading ||
      vaultLpPerformanceState.loading ||
      vaultLpInfoState.loading,
    hasError: !!(
      vaultInfoState.error ||
      vaultLpPerformanceState.error ||
      vaultLpInfoState.error
    ),
  };
};
