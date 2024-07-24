import { ComponentType, ReactNode } from "react";
import { type Chains, ConfigProviderProps } from "@orderly.network/hooks";
import { ExtensionPosition } from "@orderly.network/ui";

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

export interface OrderlyAppConfig extends ConfigProviderProps {
  appIcons?: AppLogos;
  dateFormatting?: string;
  // brokerName: string;
  components?: {
    [position in ExtensionPosition]: ComponentType;
  };
}
