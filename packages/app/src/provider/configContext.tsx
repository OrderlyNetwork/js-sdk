import { ExtensionPosition } from "@orderly.network/ui";
import { createContext, PropsWithChildren, ReactNode, useContext } from "react";
import { IRestrictedAreasParams } from "@orderly.network/hooks";
import { AppLogos } from "../types";

export type ThemeContextState = {
  appIcons?: AppLogos;
  brokerName: string;
};

const AppConfigContext = createContext<ThemeContextState>(
  {} as ThemeContextState
);

export const useAppConfig = () => {
  return useContext(AppConfigContext);
};

export const AppConfigProvider = (
  props: PropsWithChildren<{
    appIcons?: AppLogos;
    brokerName: string;
  }>
) => {
  // const { appIcons } = props;
  return (
    <AppConfigContext.Provider value={props}>
      {props.children}
    </AppConfigContext.Provider>
  );
};
