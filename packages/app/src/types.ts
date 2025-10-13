import { ComponentType, ReactNode } from "react";
import {
  ExclusiveConfigProviderProps,
  ConfigProviderProps,
} from "@kodiak-finance/orderly-hooks";
import { ExtensionPosition } from "@kodiak-finance/orderly-ui";

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
  components?: {
    [position in ExtensionPosition]: ComponentType;
  };
} & Partial<
  Omit<
    ConfigProviderProps,
    "brokerId" | "brokerName" | "configStore" | "networkId"
  >
> &
  ExclusiveConfigProviderProps;
