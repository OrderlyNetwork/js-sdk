import { createContext } from "react";

interface InputTheme {
  fix: {
    className: string;
  };
}

export interface ThemeConfigValue {
  palette: {};
  components: {
    input: InputTheme;
  };
}

export const StyleConfig = createContext({} as ThemeConfigValue);
