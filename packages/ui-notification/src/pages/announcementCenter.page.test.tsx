// @vitest-environment jsdom
import type { ComponentProps } from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { RouteOption } from "@orderly.network/types";
import { AnnouncementCenterPage } from "./announcementCenter.page";
import { AnnouncementCenterWidget } from "./announcementCenter.widget";

const mocks = vi.hoisted(() => ({
  onRouteChange: undefined as ((option: RouteOption) => void) | undefined,
}));

vi.mock("@orderly.network/react-app", () => ({
  useAppContext: () => ({ onRouteChange: mocks.onRouteChange }),
}));
vi.mock("./announcementCenter.widget", () => ({
  AnnouncementCenterWidget: vi.fn(() => null),
}));

const widgetProps = () => vi.mocked(AnnouncementCenterWidget).mock.lastCall![0];

beforeEach(() => {
  vi.clearAllMocks();
  mocks.onRouteChange = vi.fn();
});
afterEach(cleanup);

describe("announcement page navigation", () => {
  it("forwards root classes to the connected widget", () => {
    render(<AnnouncementCenterPage className="host-announcement-page" />);
    expect(widgetProps().className).toBe("host-announcement-page");
  });

  it.each([
    "/announcement/release-notes?is_official=true&category=legal&page=2",
    "/announcement?category=legal",
    "/announcement",
  ])("dispatches %s through the global callback exactly once", (url) => {
    render(<AnnouncementCenterPage slug="release-notes" />);
    widgetProps().onRouteChange(url);
    expect(mocks.onRouteChange).toHaveBeenCalledExactlyOnceWith({
      href: url,
      name: url,
      scope: "announcement",
    });
  });

  it("prefers the page router adapter over the global callback", () => {
    const onRouteChange = vi.fn();
    render(<AnnouncementCenterPage routerAdapter={{ onRouteChange }} />);
    widgetProps().onRouteChange("/announcement");
    expect(onRouteChange).toHaveBeenCalledExactlyOnceWith({
      href: "/announcement",
      name: "/announcement",
      scope: "announcement",
    });
    expect(mocks.onRouteChange).not.toHaveBeenCalled();
  });

  it.each([false, true])(
    "opens external links through the selected callback (override: %s)",
    (override) => {
      const onRouteChange = vi.fn();
      render(
        <AnnouncementCenterPage
          routerAdapter={override ? { onRouteChange } : undefined}
        />,
      );
      const url = "https://orderly.network/docs?section=api#detail";
      widgetProps().onRouteChange(url);
      expect(
        override ? onRouteChange : mocks.onRouteChange,
      ).toHaveBeenCalledExactlyOnceWith({
        href: url,
        name: url,
        scope: "announcement",
        target: "_blank",
      });
      expect(
        override ? mocks.onRouteChange : onRouteChange,
      ).not.toHaveBeenCalled();
    },
  );

  it("does nothing when neither callback is configured", () => {
    mocks.onRouteChange = undefined;
    render(<AnnouncementCenterPage />);
    expect(() => widgetProps().onRouteChange("/announcement")).not.toThrow();
  });

  it("supports the original router adapter without a global callback", () => {
    mocks.onRouteChange = undefined;
    const onRouteChange = vi.fn();
    render(<AnnouncementCenterPage routerAdapter={{ onRouteChange }} />);
    widgetProps().onRouteChange("/announcement");
    expect(onRouteChange).toHaveBeenCalledExactlyOnceWith({
      href: "/announcement",
      name: "/announcement",
      scope: "announcement",
    });
    widgetProps().onRouteChange("");
    expect(onRouteChange).toHaveBeenCalledTimes(1);
  });

  it("ignores empty URLs", () => {
    render(<AnnouncementCenterPage />);
    widgetProps().onRouteChange("");
    expect(mocks.onRouteChange).not.toHaveBeenCalled();
  });

  it("uses updated callbacks and falls back to the latest global callback", () => {
    const firstGlobal = mocks.onRouteChange;
    const { rerender } = render(<AnnouncementCenterPage />);
    const nextGlobal = vi.fn();
    mocks.onRouteChange = nextGlobal;
    rerender(<AnnouncementCenterPage />);
    widgetProps().onRouteChange("/announcement");
    expect(firstGlobal).not.toHaveBeenCalled();
    expect(nextGlobal).toHaveBeenCalledTimes(1);

    const firstOverride = vi.fn();
    rerender(
      <AnnouncementCenterPage
        routerAdapter={{ onRouteChange: firstOverride }}
      />,
    );
    const nextOverride = vi.fn();
    rerender(
      <AnnouncementCenterPage
        routerAdapter={{ onRouteChange: nextOverride }}
      />,
    );
    widgetProps().onRouteChange("/announcement");
    expect(firstOverride).not.toHaveBeenCalled();
    expect(nextOverride).toHaveBeenCalledTimes(1);
    expect(nextGlobal).toHaveBeenCalledTimes(1);

    rerender(<AnnouncementCenterPage />);
    widgetProps().onRouteChange("/announcement");
    expect(nextGlobal).toHaveBeenCalledTimes(2);
    expect(nextOverride).toHaveBeenCalledTimes(1);
  });

  it.each([
    { slug: "55" },
    { id: "55" },
    { slug: "release-notes", id: "55", isOfficial: true },
  ])(
    "preserves explicit locator and source props: %j",
    (props: ComponentProps<typeof AnnouncementCenterPage>) => {
      render(<AnnouncementCenterPage {...props} />);
      expect(widgetProps()).toMatchObject(props);
    },
  );
});
