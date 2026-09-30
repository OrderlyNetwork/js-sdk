import { useEffect, useRef, type FC } from "react";
import { useOrderlyTheme } from "@orderly.network/ui";

type ToolbarThemeSyncProps = {
  /** Theme id selected in the Storybook toolbar (globals.theme → id). */
  themeId?: string;
};

/**
 * Applies Storybook toolbar theme selection through the SDK theme provider
 * (state-first), matching the in-app ThemeSwitcher path:
 * setCurrentThemeId → localStorage → AppThemeProvider writes data-oui-theme.
 *
 * Only reacts when the toolbar selection changes, so the in-app switcher can
 * still override without being snapped back to the toolbar value.
 */
export const ToolbarThemeSync: FC<ToolbarThemeSyncProps> = ({ themeId }) => {
  const { themes, currentThemeId, setCurrentThemeId } = useOrderlyTheme();
  const prevToolbarThemeIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!themeId || !themes.some((theme) => theme.id === themeId)) {
      return;
    }

    if (themeId === prevToolbarThemeIdRef.current) {
      return;
    }
    prevToolbarThemeIdRef.current = themeId;

    if (themeId !== currentThemeId) {
      setCurrentThemeId?.(themeId);
    }
  }, [themeId, currentThemeId, themes, setCurrentThemeId]);

  return null;
};
