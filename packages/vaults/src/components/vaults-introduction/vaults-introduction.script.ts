import { useMemo } from "react";
import { useVaultsStore } from "../../store";

export const useVaultsIntroductionScript = () => {
  const { vaultInfo } = useVaultsStore();

  const vaultsInfo = useMemo(() => {
    const tvl = vaultInfo.data.reduce((acc, vault) => {
      return acc + vault.tvl;
    }, 0);
    const lpCount = vaultInfo.data.reduce((acc, vault) => {
      return acc + vault.lp_counts;
    }, 0);

    return {
      tvl,
      lpCount,
      vaultsCount: vaultInfo.data.length,
    };
  }, [vaultInfo.data]);

  return {
    vaultsInfo,
  };
};

export type VaultsIntroductionScript = ReturnType<
  typeof useVaultsIntroductionScript
>;
