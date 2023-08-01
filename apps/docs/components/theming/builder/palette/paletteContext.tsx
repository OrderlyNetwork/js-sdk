import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from "react";
import { NamedColor, NamedColorGroup } from "@/types/theme";
import { COLOR_PALETTE } from "@/components/theming/constants/colorPalette";
import { ThemeContext } from "@/components/theming/themeContext";

export type ActiveColor = {
  color: NamedColor;
  groupName: string;
  cssVarName: string;
};

export interface PaletteContextState {
  colorPalette: NamedColorGroup[];
  currentColorPalette: ActiveColor | null;
  setCurrentColorPalette: (color: ActiveColor | null) => void;
  cleanCurrentColorPalette: () => void;
  updateCurrentColorPalette: (color: string, name: string) => void;
}

export const PaletteContext = createContext({} as PaletteContextState);

export const PaletteProvider: FC<PropsWithChildren> = ({ children }) => {
  const [currentColorPalette, setCurrentColorPalette] =
    useState<ActiveColor | null>(null);
  const { theme } = useContext(ThemeContext);
  const cleanCurrentColorPalette = () => {
    setCurrentColorPalette(null);
  };

  const updateCurrentColorPalette = (color: string, name: string) => {
    if (currentColorPalette) return;
  };

  const colorPalette = useMemo(() => {
    if (!theme?.palette) return COLOR_PALETTE;
    if (theme?.palette.length === 0) return COLOR_PALETTE;
    return theme.palette;
  }, [theme]);

  return (
    <PaletteContext.Provider
      value={{
        currentColorPalette,
        colorPalette,
        setCurrentColorPalette,
        cleanCurrentColorPalette,
        updateCurrentColorPalette,
      }}
    >
      {children}
    </PaletteContext.Provider>
  );
};
