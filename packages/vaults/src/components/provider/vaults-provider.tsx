import { FC, PropsWithChildren, useEffect } from "react";
import { useSVApiUrl } from "../../hooks/useSVAPIUrl";
import { VaultsPageProps } from "../../pages";
import { useVaultsStore } from "../../store";

export const VaultsProvider: FC<PropsWithChildren<VaultsPageProps>> = (
  props,
) => {
  const svApiUrl = useSVApiUrl();
  const { fetchVaultInfo, setVaultsPageConfig } = useVaultsStore();

  useEffect(() => {
    if (props.config) {
      setVaultsPageConfig(props.config);
    }
  }, [props.config]);

  useEffect(() => {
    if (!svApiUrl) {
      return;
    }
    fetchVaultInfo(svApiUrl);
  }, [svApiUrl]);

  return <div>{props.children}</div>;
};
