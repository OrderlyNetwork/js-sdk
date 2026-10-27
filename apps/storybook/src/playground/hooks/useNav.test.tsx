// @vitest-environment jsdom
import type { PropsWithChildren } from "react";
import { MemoryRouter, useLocation, useNavigationType } from "react-router";
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { i18n } from "@orderly.network/i18n";
import type { RouteOption } from "@orderly.network/types";
import { useNav } from "./useNav";

vi.mock("@orderly.network/portfolio", () => ({
  PortfolioLeftSidebarPath: { FeeTier: "/feeTier", ApiKey: "/apiKey" },
}));
vi.mock("../perpSymbolStorage", () => ({
  getPerpSymbol: () => "PERP_ETH_USDC",
}));

const initialEntry =
  "/en/announcement/release-notes?networkId=testnet&category=legal&page=2&is_official=true";
beforeEach(async () => {
  window.history.replaceState({}, "", initialEntry);
  await i18n.changeLanguage("en");
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function setup() {
  return renderHook(
    () => ({
      ...useNav(),
      location: useLocation(),
      navigationType: useNavigationType(),
    }),
    {
      wrapper: ({ children }: PropsWithChildren) => (
        <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>
      ),
    },
  );
}

describe("Playground global announcement navigation", () => {
  it.each([
    [
      "/announcement?networkId=testnet&category=listing",
      "/en/announcement?networkId=testnet&category=listing",
    ],
    [
      "/announcement?networkId=testnet&category=legal",
      "/en/announcement?networkId=testnet&category=legal",
    ],
    ["/announcement?networkId=testnet", "/en/announcement?networkId=testnet"],
    ["/announcement", "/en/announcement"],
    ["/announcement?", "/en/announcement"],
    [
      "/announcement/55?is_official=false#detail",
      "/en/announcement/55?is_official=false#detail",
    ],
    ["/announcement#list", "/en/announcement#list"],
    ["/zh/announcement?category=legal", "/zh/announcement?category=legal"],
    ["/?networkId=testnet", "/en/perp/PERP_ETH_USDC?networkId=testnet"],
  ])("uses the full target URL %s", (href, expected) => {
    const { result } = setup();
    act(() =>
      result.current.onRouteChange({ href, name: href, scope: "announcement" }),
    );
    const { pathname, search, hash } = result.current.location;
    expect(`${pathname}${search}${hash}`).toBe(expected);
  });

  it("retains ordinary navigation's query inheritance", () => {
    const { result } = setup();
    act(() =>
      result.current.onRouteChange({ href: "/markets", name: "Markets" }),
    );
    expect(result.current.location.pathname).toBe("/en/markets");
    expect(result.current.location.search).toBe(
      new URL(initialEntry, window.location.origin).search,
    );
  });

  it("preserves replacement navigation", () => {
    const { result } = setup();
    act(() =>
      result.current.onRouteChange({
        href: "/announcement",
        name: "Announcements",
        scope: "announcement",
        replace: true,
      }),
    );
    expect(result.current.navigationType).toBe("REPLACE");
    expect(result.current.location.pathname).toBe("/en/announcement");
    expect(result.current.location.search).toBe("");
  });

  it("opens external links without modifying their URL", () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    const { result } = setup();
    const option: RouteOption = {
      href: "https://orderly.network/docs?section=api#detail",
      name: "Docs",
      target: "_blank",
      scope: "announcement",
    };
    act(() => result.current.onRouteChange(option));
    expect(open).toHaveBeenCalledExactlyOnceWith(option.href);
    expect(result.current.location.pathname).toBe(
      "/en/announcement/release-notes",
    );
  });
});
