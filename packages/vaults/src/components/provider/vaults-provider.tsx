import { FC, PropsWithChildren, useEffect } from "react";
import { useSVApiUrl } from "../../hooks/useSVAPIUrl";
import { useVaultsStore } from "../../store";

export type VaultsProviderProps = {
  children: React.ReactNode;
};

export const VaultsProvider: FC<PropsWithChildren<VaultsProviderProps>> = (
  props,
) => {
  const svApiUrl = useSVApiUrl();
  const { fetchVaultInfo } = useVaultsStore();

  useEffect(() => {
    if (!svApiUrl) {
      return;
    }
    fetchVaultInfo(svApiUrl);
  }, [svApiUrl]);

  return <div>{props.children}</div>;
};
