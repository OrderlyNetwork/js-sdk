import { createContext } from "react";

interface InputTheme {
  fix: {
    className: string;
  };
}

interface NumeralTheme {
  // if the value is not a number or not a valid number, the component will show this string
  errorCover: string;
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
    numeral: NumeralTheme;
  };
}

export const StyleConfig = createContext({} as ThemeConfigValue);
