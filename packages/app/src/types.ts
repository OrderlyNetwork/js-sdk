import { ComponentType, ReactNode } from "react";
import { ConfigProviderProps } from "@orderly.network/hooks";
import { ExtensionPosition } from "@orderly.network/ui";
import { type ConfigStore } from "@orderly.network/core";

type Logo = {
  // the logo image url
  img?: string;
  // also can use React component
  component?: ReactNode;
  className?: string;
};

export type AppLogos = Partial<{
  // logo for top navigation bar
  main: Logo;
  // logo for popover/dialog header
  secondary: Logo;
}>;

export type OrderlyAppConfig = {
  appIcons?: AppLogos;
  dateFormatting?: string;
  // brokerName: string;
  components?: {
    [position in ExtensionPosition]: ComponentType;
  };
} & Partial<
  Omit<
    ConfigProviderProps,
    "walletAdapters" | "brokerId" | "brokerName" | "configStore"
  >
> &
  ConfigProviderOptionalProps;

export type ConfigProviderOptionalProps =
  | {
      brokerId: string;
      brokerName?: string;
      configStore?: never;
    }
  | {
      brokerId?: never;
      brokerName?: never;
      configStore: ConfigStore;
    };
