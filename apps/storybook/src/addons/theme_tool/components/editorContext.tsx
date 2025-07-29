import React, { useRef, useState } from "react";
import { useChannel } from "storybook/manager-api";
import { EVENTS } from "../constants";
import { EditorContext } from "./context";

export type Theme = Record<string, string>;

type ViewMode = "visual" | "code";

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
    changedValues?: Record<string, string>,
  ) => {
    setTheme(theme);
    emit(EVENTS.CHANGE, { changedValues: changedValues || theme });
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
