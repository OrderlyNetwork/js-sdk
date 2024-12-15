import { createContext, useContext, useRef, useState } from "react";
import { useChannel } from "@storybook/manager-api";
import { EVENTS } from "../constants";
import { styled } from "@storybook/theming";

export type Theme = {
  [key: string]: string;
};

type ViewMode = "visual" | "code";

export const EditorContext = createContext<{
  theme: Theme;
  mode: ViewMode;
  setTheme: (theme: Theme, changedValues: Record<string, string>) => void;
  setMode: (mode: ViewMode) => void;
  resetTheme: () => void;
  loading: boolean;
}>({
  theme: {},
  mode: "visual",
  setTheme: (theme: Theme, changedValues: Record<string, string>) => {
    console.log(theme, changedValues);
  },
  setMode: (mode: ViewMode) => {
    console.log(mode);
  },
  resetTheme: () => {},
  loading: false,
});

export const EditorProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<ViewMode>("visual");
  const defaultThemeRef = useRef<Theme | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<Theme>({});

  const emit = useChannel({
    [EVENTS.THEME_RESTORE]: (theme: Theme) => {
      defaultThemeRef.current = theme;
      setTheme(theme);
      setLoading(false);
    },
  });

  const handleSetTheme = (
    theme: Theme,
    changedValues: Record<string, string>
  ) => {
    setTheme(theme);
    // console.log("++++theme", theme);
    emit(EVENTS.CHANGE, { changedValues });
  };

  const resetTheme = () => {
    if (defaultThemeRef.current) {
      setTheme(defaultThemeRef.current);
      emit(EVENTS.CHANGE, {
        changedValues: defaultThemeRef.current,
      });
    }
  };

  return (
    <EditorContext.Provider
      value={{
        theme,
        mode,
        setTheme: handleSetTheme,
        setMode,
        resetTheme,
        loading,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export default EditorContext;
