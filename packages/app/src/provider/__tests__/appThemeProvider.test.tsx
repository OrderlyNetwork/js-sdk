import type { ReactNode } from "react";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ThemeConfig } from "@orderly.network/ui";
import {
  AppThemeProvider,
  ORDERLY_THEME_STORAGE_KEY,
} from "../appThemeProvider";

type CapturedThemeProviderProps = {
  children?: ReactNode;
  currentTheme?: ThemeConfig;
  currentThemeId?: string;
};

const themeProviderState = vi.hoisted(() => ({
  props: undefined as CapturedThemeProviderProps | undefined,
}));

vi.mock("@orderly.network/hooks", async () => {
  const { useLocalStorage } =
    await import("@orderly.network/hooks/src/useLocalStorage");

  return { useLocalStorage };
});

vi.mock("@orderly.network/ui", () => ({
  DARK_THEME_CSS_VARS: {
    "--oui-color-primary": "dark-primary",
    "--oui-color-base-9": "dark-base-9",
  },
  LIGHT_THEME_CSS_VARS: {
    "--oui-color-primary": "light-primary",
    "--oui-color-base-9": "light-base-9",
  },
  OrderlyThemeProvider: (props: CapturedThemeProviderProps) => {
    themeProviderState.props = props;
    return props.children;
  },
}));

const darkTheme: ThemeConfig = {
  id: "orderly",
  displayName: "Dark",
  mode: "dark",
  isDefault: true,
};

const lightTheme: ThemeConfig = {
  id: "light",
  displayName: "Light",
  mode: "light",
};

const renderProvider = (themes?: ThemeConfig[]) => {
  return render(
    <AppThemeProvider themes={themes}>
      <div>content</div>
    </AppThemeProvider>,
  );
};

describe("AppThemeProvider", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-oui-theme");
    document.documentElement.style.removeProperty("--oui-color-primary");
    document.documentElement.style.removeProperty("--oui-color-base-9");
    themeProviderState.props = undefined;
  });

  afterEach(() => {
    cleanup();
  });

  it("uses and persists the theme marked as default", async () => {
    renderProvider([lightTheme, darkTheme]);

    expect(themeProviderState.props?.currentThemeId).toBe("orderly");
    expect(themeProviderState.props?.currentTheme).toBe(darkTheme);

    await waitFor(() => {
      expect(window.localStorage.getItem(ORDERLY_THEME_STORAGE_KEY)).toBe(
        '"orderly"',
      );
      expect(document.documentElement.getAttribute("data-oui-theme")).toBe(
        "orderly",
      );
    });
  });

  it("keeps a valid stored theme instead of replacing it with the default", async () => {
    window.localStorage.setItem(ORDERLY_THEME_STORAGE_KEY, '"light"');

    renderProvider([darkTheme, lightTheme]);

    await waitFor(() => {
      expect(themeProviderState.props?.currentThemeId).toBe("light");
      expect(themeProviderState.props?.currentTheme).toBe(lightTheme);
      expect(window.localStorage.getItem(ORDERLY_THEME_STORAGE_KEY)).toBe(
        '"light"',
      );
    });
  });

  it("replaces an invalid stored theme with the default theme", async () => {
    window.localStorage.setItem(ORDERLY_THEME_STORAGE_KEY, '"removed"');

    renderProvider([lightTheme, darkTheme]);

    expect(themeProviderState.props?.currentThemeId).toBe("orderly");

    await waitFor(() => {
      expect(window.localStorage.getItem(ORDERLY_THEME_STORAGE_KEY)).toBe(
        '"orderly"',
      );
    });
  });

  it("uses the first theme when no theme is marked as default", async () => {
    const firstTheme = { ...lightTheme };
    const secondTheme = { ...darkTheme, isDefault: false };

    renderProvider([firstTheme, secondTheme]);

    expect(themeProviderState.props?.currentThemeId).toBe("light");

    await waitFor(() => {
      expect(window.localStorage.getItem(ORDERLY_THEME_STORAGE_KEY)).toBe(
        '"light"',
      );
    });
  });

  it("uses the first theme when multiple themes are marked as default", () => {
    const firstDefault = { ...lightTheme, isDefault: true };
    const secondDefault = { ...darkTheme };

    renderProvider([firstDefault, secondDefault]);

    expect(themeProviderState.props?.currentThemeId).toBe("light");
    expect(themeProviderState.props?.currentTheme).toBe(firstDefault);
  });

  it("fills missing dark theme css vars with dark defaults", () => {
    renderProvider([
      {
        ...darkTheme,
        cssVars: {
          "--oui-color-primary": "custom-primary",
        },
      },
    ]);

    expect(
      document.documentElement.style.getPropertyValue("--oui-color-primary"),
    ).toBe("custom-primary");
    expect(
      document.documentElement.style.getPropertyValue("--oui-color-base-9"),
    ).toBe("dark-base-9");
  });

  it("fills missing light theme css vars with light defaults", () => {
    renderProvider([
      {
        ...lightTheme,
        cssVars: {
          "--oui-color-primary": "custom-primary",
        },
      },
    ]);

    expect(
      document.documentElement.style.getPropertyValue("--oui-color-primary"),
    ).toBe("custom-primary");
    expect(
      document.documentElement.style.getPropertyValue("--oui-color-base-9"),
    ).toBe("light-base-9");
  });

  it("updates css vars when a theme with the same id changes mode", () => {
    const themeId = "shared-theme";
    const { rerender } = renderProvider([{ ...darkTheme, id: themeId }]);

    expect(
      document.documentElement.style.getPropertyValue("--oui-color-base-9"),
    ).toBe("dark-base-9");

    rerender(
      <AppThemeProvider themes={[{ ...lightTheme, id: themeId }]}>
        <div>content</div>
      </AppThemeProvider>,
    );

    expect(
      document.documentElement.style.getPropertyValue("--oui-color-base-9"),
    ).toBe("light-base-9");
  });

  it("preserves an explicitly empty css var override", () => {
    renderProvider([
      {
        ...darkTheme,
        cssVars: {
          "--oui-color-primary": "",
        },
      },
    ]);

    expect(
      document.documentElement.style.getPropertyValue("--oui-color-primary"),
    ).toBe("");
  });

  it("clears the DOM theme and does not persist when themes are empty", () => {
    document.documentElement.setAttribute("data-oui-theme", "previous");

    renderProvider([]);

    expect(themeProviderState.props?.currentThemeId).toBeUndefined();
    expect(themeProviderState.props?.currentTheme).toBeUndefined();
    expect(document.documentElement.hasAttribute("data-oui-theme")).toBe(false);
    expect(window.localStorage.getItem(ORDERLY_THEME_STORAGE_KEY)).toBeNull();
  });
});
