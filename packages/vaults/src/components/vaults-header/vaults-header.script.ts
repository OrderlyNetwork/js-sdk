import { useMemo } from "react";
import { uniqBy } from "ramda";
import { useVaultsStore } from "../../store";
import { VaultSupportedChain } from "../../types/vault";

export const useVaultsHeaderScript = () => {
  const { vaultInfo } = useVaultsStore();

  const supportVaults = useMemo(() => {
    const array: VaultSupportedChain[] = [];
    vaultInfo.data.forEach((vault) => {
      array.push(...vault.supported_chains);
    });

    return uniqBy((item) => item.chain_id, array);
  }, [vaultInfo.data]);

  return {
    supportVaults,
  };
};

export type VaultsHeaderScript = ReturnType<typeof useVaultsHeaderScript>;
