import React, { createContext, PropsWithChildren, useContext } from "react";
import { AppLogos } from "../types";

export type ThemeContextState = {
  appIcons?: AppLogos;
  brokerName: string;
};

const AppConfigContext = createContext<ThemeContextState>(
  {} as ThemeContextState,
);

export const useAppConfig = () => {
  return useContext(AppConfigContext);
};

export const AppConfigProvider: React.FC<
  PropsWithChildren<{ appIcons?: AppLogos; brokerName: string }>
> = (props) => {
  return (
    <AppConfigContext.Provider value={props}>
      {props.children}
    </AppConfigContext.Provider>
  );
};
