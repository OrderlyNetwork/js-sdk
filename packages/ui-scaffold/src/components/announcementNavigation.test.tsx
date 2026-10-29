// @vitest-environment jsdom
import type { PropsWithChildren, ReactNode } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AnnouncementSummary } from "@orderly.network/ui-notification";
import { MessageCenter } from "./messageCenter/msgCenter.ui";
import { NotificationUI } from "./notification/notification.ui";

const fixture = vi.hoisted(() => ({
  onRouteChange: vi.fn(),
  onClose: vi.fn(),
}));
vi.mock("./scaffold", () => ({
  useScaffoldContext: () => ({
    routerAdapter: { onRouteChange: fixture.onRouteChange },
  }),
}));
vi.mock("@orderly.network/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@orderly.network/utils", () => ({
  windowGuard: (callback: () => void) => callback(),
}));
vi.mock("@orderly.network/ui", () => {
  const Wrapper = ({ children }: PropsWithChildren) => <>{children}</>;
  return {
    cn: (...values: unknown[]) => values.filter(Boolean).join(" "),
    BellIcon: () => null,
    DialogHeader: Wrapper,
    DialogBody: Wrapper,
    DialogContent: Wrapper,
    Dialog: Wrapper,
    Divider: () => null,
    DialogTitle: Wrapper,
    TooltipProvider: Wrapper,
    TooltipRoot: Wrapper,
    TooltipTrigger: Wrapper,
    TooltipContent: Wrapper,
    Popover: ({
      children,
      content,
    }: PropsWithChildren<{ content: ReactNode }>) => (
      <>
        {children}
        {content}
      </>
    ),
  };
});
vi.mock("@orderly.network/ui-notification", () => {
  const Items = ({
    dataSource,
    onItemClick,
    onViewAll,
  }: {
    dataSource: AnnouncementSummary[];
    onItemClick: (url: string) => void;
    onViewAll?: () => void;
  }) => (
    <>
      {dataSource.map((item) => (
        <button
          key={item.announcement_id}
          onClick={() => onItemClick(item.url!)}
        >
          Read announcement
        </button>
      ))}
      {onViewAll && <button onClick={onViewAll}>View all</button>}
    </>
  );
  return { AnnouncementCenterUI: Items, NotificationUI: Items };
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("requestAnimationFrame", vi.fn());
  window.history.replaceState(
    {},
    "",
    "/perp/PERP_BTC_USDC?theme=old&is_official=true",
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe.each(["bell", "card"] as const)("%s detail navigation", (entry) => {
  function show(url: string, isOfficial?: boolean) {
    const dataSource: AnnouncementSummary[] = [
      {
        announcement_id: 55,
        title: "Release notes",
        message: "Body",
        url,
        is_official: isOfficial,
      },
    ];
    render(
      entry === "bell" ? (
        <MessageCenter
          messages={dataSource}
          showAnnouncement={false}
          closeTips={fixture.onClose}
        />
      ) : (
        <NotificationUI
          dataSource={dataSource}
          showAnnouncement
          onClose={fixture.onClose}
        />
      ),
    );
  }
  it.each([true, false])(
    "merges the query at click time and overrides source with %s",
    (isOfficial) => {
      show(`/announcement/release-notes?is_official=${isOfficial}`, isOfficial);
      // Change the location after rendering, without rerendering the entrance.
      window.history.replaceState(
        {},
        "",
        `/perp/PERP_BTC_USDC?brokerId=test&theme=dark&category=legal&page=3&tag=a&tag=b&is_official=${!isOfficial}&is_official=stale`,
      );
      fireEvent.click(screen.getByText("Read announcement"));
      const expected = `/announcement/release-notes?brokerId=test&theme=dark&category=legal&page=3&tag=a&tag=b&is_official=${isOfficial}`;
      expect(fixture.onRouteChange).toHaveBeenCalledExactlyOnceWith({
        href: expected,
        name: expected,
        target: "_self",
        scope: "announcement",
      });
      if (entry === "card") expect(fixture.onClose).toHaveBeenCalledOnce();
    },
  );
  it.each([true, false])(
    "uses the target announcement's %s source even if its URL has a different value",
    (isOfficial) => {
      show(
        `/announcement/release-notes?is_official=${!isOfficial}`,
        isOfficial,
      );
      fireEvent.click(screen.getByText("Read announcement"));
      expect(fixture.onRouteChange).toHaveBeenCalledWith({
        href: `/announcement/release-notes?theme=old&is_official=${isOfficial}`,
        name: expect.any(String),
        target: "_self",
        scope: "announcement",
      });
    },
  );
  it("preserves target query values and hash while keeping unrelated current parameters", () => {
    show(
      "/announcement/release-notes?is_official=true&campaign=target#details",
    );
    window.history.replaceState(
      {},
      "",
      "/announcement?brokerId=test&campaign=old&theme=dark#old",
    );
    fireEvent.click(screen.getByText("Read announcement"));
    expect(fixture.onRouteChange).toHaveBeenCalledWith({
      href: "/announcement/release-notes?brokerId=test&theme=dark&is_official=true&campaign=target#details",
      name: expect.any(String),
      target: "_self",
      scope: "announcement",
    });
  });
  it.each(["/announcement/55", "/announcement/release-notes"])(
    "preserves query without inheriting source on %s",
    (url) => {
      show(url);
      window.history.replaceState(
        {},
        "",
        "/announcement?brokerId=test&is_official=true",
      );
      fireEvent.click(screen.getByText("Read announcement"));
      expect(fixture.onRouteChange).toHaveBeenCalledWith({
        href: `${url}?brokerId=test`,
        name: `${url}?brokerId=test`,
        target: "_self",
        scope: "announcement",
      });
    },
  );
  it("does not leave a trailing query delimiter when the current query is empty", () => {
    show("/announcement/55");
    window.history.replaceState({}, "", "/announcement");
    fireEvent.click(screen.getByText("Read announcement"));
    expect(fixture.onRouteChange).toHaveBeenCalledWith({
      href: "/announcement/55",
      name: "/announcement/55",
      target: "_self",
      scope: "announcement",
    });
  });
  it.each([
    "/announcement",
    "/announcement?category=legal",
    "/announcement#latest",
    "/announcement/",
  ])("scopes the local list destination %s without rewriting it", (url) => {
    show(url);
    fireEvent.click(screen.getByText("Read announcement"));
    expect(fixture.onRouteChange).toHaveBeenCalledExactlyOnceWith({
      href: url,
      name: url,
      target: "_self",
      scope: "announcement",
    });
  });
  it.each([
    "https://example.com/announcement/release-notes?campaign=target&is_official=true#details",
    "https://example.com/promo?campaign=target",
    "/campaign?campaign=target",
    "/announcement-archive?campaign=target",
  ])("keeps explicit non-detail link %s unchanged", (url) => {
    show(url, false);
    fireEvent.click(screen.getByText("Read announcement"));
    expect(fixture.onRouteChange).toHaveBeenCalledExactlyOnceWith({
      href: url,
      name: url,
      target: url.startsWith("/") ? "_self" : "_blank",
    });
  });
});

it("scopes view-all navigation and removes category and page while retaining broker context", () => {
  render(
    <MessageCenter
      messages={[]}
      showAnnouncement={false}
      closeTips={fixture.onClose}
    />,
  );
  window.history.replaceState(
    {},
    "",
    "/announcement?brokerId=test&theme=dark&category=legal&page=3",
  );
  fireEvent.click(screen.getByText("View all"));
  expect(fixture.onRouteChange).toHaveBeenCalledWith({
    href: "/announcement?brokerId=test&theme=dark",
    name: expect.any(String),
    target: "_self",
    scope: "announcement",
  });
});

it("does not leave a trailing query delimiter when view all removes every parameter", () => {
  render(
    <MessageCenter
      messages={[]}
      showAnnouncement={false}
      closeTips={fixture.onClose}
    />,
  );
  window.history.replaceState({}, "", "/announcement?category=legal&page=3");
  fireEvent.click(screen.getByText("View all"));
  expect(fixture.onRouteChange).toHaveBeenCalledWith({
    href: "/announcement",
    name: expect.any(String),
    target: "_self",
    scope: "announcement",
  });
});
