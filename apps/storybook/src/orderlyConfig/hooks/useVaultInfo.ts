import { useSWR } from "@orderly.network/hooks";
import { commify } from "@orderly.network/utils";
import { PathEnum } from "../../playground/constant";

// Vault API URLs mapping - aligned with packages/vaults/src/api/env.ts
const VAULTS_API_URLS: Record<"prod" | "staging" | "qa" | "dev", string> = {
  prod: "https://api-sv.orderly.org",
  staging: "https://testnet-api-sv.orderly.org",
  qa: "https://qa-api-sv-aliyun.orderly.org",
  dev: "https://dev-api-sv.orderly.org",
};

export type VaultInfo = {
  vault_name: string;
  tvl: number;
  lifetime_apy: number;
};

type VaultInfoResponse = {
  success: boolean;
  data: {
    rows: VaultInfo[];
  };
};

const { VITE_ENV } = import.meta.env || {};

const getVaultUrl = () => {
  let env = (VITE_ENV?.replace("-evm", "") || "staging").toLowerCase();

  if (env === "testnet") {
    env = "staging";
  }

  const vaultEnv =
    env === "prod" || env === "qa" || env === "dev" ? env : "staging";
  const baseUrl = VAULTS_API_URLS[vaultEnv];

  return `${baseUrl}/v1/public/strategy_vault/vault/info`;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export type SortConfig = {
  key: "tvl" | "apy";
  direction: "asc" | "desc";
};

export const useVaultInfo = (
  isOpen: boolean,
  sortConfig?: SortConfig | null,
) => {
  const url = getVaultUrl();

  const { data, isLoading, error } = useSWR<VaultInfoResponse>(
    isOpen ? url : null,
    fetcher,
    {
      revalidateOnFocus: false,
    },
  );

  const rows = data?.data.rows || [];
  const sortedRows = sortConfig
    ? [...rows].sort((a, b) => {
        const { key, direction } = sortConfig;

        let valA, valB;

        if (key === "tvl") {
          valA = a.tvl;
          valB = b.tvl;
        } else {
          valA = a.lifetime_apy;
          valB = b.lifetime_apy;
        }

        return direction === "asc" ? valA - valB : valB - valA;
      })
    : rows;

  const formattedData = sortedRows?.map((item) => ({
    name: item.vault_name,
    tvl: `$${commify(item.tvl.toFixed(2))}`,
    apy: `${(item.lifetime_apy * 100).toFixed(2)}%`,
    apyColor:
      item.lifetime_apy > 0
        ? "oui-text-trade-profit"
        : item.lifetime_apy < 0
          ? "oui-text-trade-loss"
          : "oui-text-base-contrast-54",
    link: PathEnum.Vaults,
  }));

  return {
    data: formattedData,
    isLoading,
    error,
  };
};
