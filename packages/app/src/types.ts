import { type Chains, ConfigProviderProps } from "@orderly.network/hooks";

export interface OrderlyAppConfig extends ConfigProviderProps {
  brokerName: string;
}
