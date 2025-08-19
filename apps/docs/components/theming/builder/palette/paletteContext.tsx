import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { COLOR_PALETTE } from "@/components/theming/constants/colorPalette";
import { ThemeContext } from "@/components/theming/themeContext";
import { NamedColor, NamedColorGroup } from "@/types/theme";

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

  const cleanCurrentColorPalette = useCallback(() => {
    setCurrentColorPalette(null);
  }, [setCurrentColorPalette]);

  const updateCurrentColorPalette = (color: string, name: string) => {
    if (currentColorPalette) {
      return;
    }
  };

  const colorPalette = useMemo(() => {
    if (!theme?.palette) {
      return COLOR_PALETTE;
    }
    if (theme?.palette.length === 0) {
      return COLOR_PALETTE;
    }
    return theme.palette;
  }, [theme]);

  const memoizedValue = useMemo<PaletteContextState>(() => {
    return {
      currentColorPalette,
      colorPalette,
      setCurrentColorPalette,
      cleanCurrentColorPalette,
      updateCurrentColorPalette,
    };
  }, [
    currentColorPalette,
    colorPalette,
    setCurrentColorPalette,
    cleanCurrentColorPalette,
    updateCurrentColorPalette,
  ]);

  return (
    <PaletteContext.Provider value={memoizedValue}>
      {children}
    </PaletteContext.Provider>
  );
};
