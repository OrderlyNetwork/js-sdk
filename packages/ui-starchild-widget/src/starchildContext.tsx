import React, {
  createContext,
  useContext,
  useMemo,
  type FC,
  type PropsWithChildren,
} from "react";
import { useOrderlyContext } from "@orderly.network/hooks";
import type { StarchildConfig, StarchildProviderConfig } from "./types";

const STARCHILD_TESTNET_URL = "https://api-testnet.iamstarchild.com/";
const STARCHILD_MAINNET_URL = "https://api-mainnet.iamstarchild.com/";

const StarchildConfigContext = createContext<StarchildConfig | undefined>(
  undefined,
);

export type StarchildProviderProps = PropsWithChildren<{
  config: StarchildProviderConfig;
}>;

export const StarchildProvider: FC<StarchildProviderProps> = ({
  config,
  children,
}) => {
  const orderlyContext = useOrderlyContext();

  const resolvedConfig = useMemo<StarchildConfig | undefined>(() => {
    if (!config?.enable) return undefined;

    const orderlyEnv =
      (orderlyContext?.configStore?.get("env") as string) ?? "";
    const telegram_bot_id = config.getBotId(orderlyEnv);
    if (!telegram_bot_id) return undefined;

    const env = orderlyEnv === "prod" ? "mainnet" : "testnet";
    const url =
      env === "testnet" ? STARCHILD_TESTNET_URL : STARCHILD_MAINNET_URL;

    return {
      enable: config.enable,
      env,
      telegram_bot_id,
      url,
    };
  }, [config, orderlyContext?.configStore]);

  return (
    <StarchildConfigContext.Provider value={resolvedConfig}>
      {children}
    </StarchildConfigContext.Provider>
  );
};

export function useStarchildConfig(): StarchildConfig | undefined {
  return useContext(StarchildConfigContext);
}
