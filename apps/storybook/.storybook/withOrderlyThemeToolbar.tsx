import { DecoratorHelpers } from "@storybook/addon-themes";
import type { Decorator, StoryContext } from "@storybook/react-vite";
import { themes } from "../src/orderlyConfig/themes";

const { initializeThemeState, pluckThemeFromContext } = DecoratorHelpers;

/**
 * Resolve the Storybook toolbar label (displayName). Prefer matching
 * VITE_DEFAULT_THEME as an id (legacy) or displayName, then fall back to
 * the theme marked isDefault.
 */
export function resolveDefaultThemeDisplayName(): string {
  const envTheme = import.meta.env.VITE_DEFAULT_THEME as string | undefined;
  const byId = themes.find((theme) => theme.id === envTheme);
  if (byId) return byId.displayName;
  const byDisplayName = themes.find((theme) => theme.displayName === envTheme);
  if (byDisplayName) return byDisplayName.displayName;
  return (
    themes.find((theme) => theme.isDefault)?.displayName ||
    themes[0]?.displayName ||
    "Dark"
  );
}

export function resolveThemeIdFromToolbarLabel(
  label: string | undefined,
): string | undefined {
  if (!label) return undefined;
  return (
    themes.find((theme) => theme.displayName === label)?.id ??
    themes.find((theme) => theme.id === label)?.id
  );
}

export function resolveToolbarThemeId(context: StoryContext): string {
  const { themeOverride } = context.parameters.themes ?? {};
  const selected = pluckThemeFromContext(context);
  const label = themeOverride || selected || resolveDefaultThemeDisplayName();
  return (
    resolveThemeIdFromToolbarLabel(label) ??
    themes.find((theme) => theme.isDefault)?.id ??
    themes[0]?.id ??
    "orderly"
  );
}

const defaultThemeDisplayName = resolveDefaultThemeDisplayName();

/**
 * Registers themes with @storybook/addon-themes toolbar only — does not
 * write `data-oui-theme`. Provider state (via ToolbarThemeSync) owns the DOM.
 */
export const withOrderlyThemeToolbar: Decorator = (() => {
  initializeThemeState(
    themes.map((theme) => theme.displayName),
    defaultThemeDisplayName,
  );

  return (Story) => <Story />;
})();
