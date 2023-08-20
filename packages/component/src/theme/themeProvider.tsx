import { createContext } from "react";

interface InputTheme {
  fix: {
    className: string;
  };
}

export interface ThemeConfigValue {
  palette: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    danger: string;
  };
  components: {
    input: InputTheme;
  };
}

export const StyleConfig = createContext({} as ThemeConfigValue);
