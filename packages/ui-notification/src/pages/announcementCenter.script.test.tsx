// @vitest-environment jsdom
import type { PropsWithChildren } from "react";
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  AnnouncementArticlesContext,
  type AnnouncementArticlesValue,
} from "../articles/context";
import { useAnnouncementCenterScript } from "./announcementCenter.script";

const config = vi.hoisted(() => ({
  widgetConfigs: undefined as
    | { announcement?: { excludeOfficial?: boolean } }
    | undefined,
}));
vi.mock("@orderly.network/react-app", () => ({
  useAppContext: () => ({ widgetConfigs: config.widgetConfigs }),
}));
vi.mock("@orderly.network/hooks", () => ({ useConfig: () => "Broker" }));
const getList = vi.fn();
const watchList = vi.fn(() => vi.fn());
const loadDetail = vi.fn();
const getDetail = vi.fn();
const getDetailBySlug = vi.fn();
const loadDetailBySlug = vi.fn();
const onRouteChange = vi.fn();
const value: AnnouncementArticlesValue = {
  articles: [],
  status: "ready",
  refresh: vi.fn(),
  retry: vi.fn(),
  getList,
  watchList,
  loadDetail,
  getDetailBySlug,
  loadDetailBySlug,
  getDetail,
};
const wrapper = ({ children }: PropsWithChildren) => (
  <AnnouncementArticlesContext.Provider value={value}>
    {children}
  </AnnouncementArticlesContext.Provider>
);
beforeEach(() => {
  config.widgetConfigs = undefined;
  window.history.replaceState({}, "", "/announcement");
  getList
    .mockReset()
    .mockReturnValue({ articles: [], total: 81, status: "ready" });
  watchList.mockClear();
  loadDetail.mockReset();
  getDetail.mockReset().mockReturnValue({ status: "ready" });
  getDetailBySlug.mockReset().mockReturnValue({ status: "ready" });
  loadDetailBySlug.mockReset();
  onRouteChange.mockReset();
});

describe("slug detail routes", () => {
  it.each([{ slug: "55" }, { slug: "release-notes", id: "90" }])(
    "uses explicit slug lookup for %j",
    (options) => {
      const { result, rerender } = renderHook(
        () => useAnnouncementCenterScript(options),
        { wrapper },
      );
      expect(result.current.isDetail).toBe(true);
      expect(getDetailBySlug).toHaveBeenCalledWith(options.slug, false);
      expect(loadDetailBySlug).toHaveBeenCalledExactlyOnceWith(
        options.slug,
        false,
        true,
      );
      expect(loadDetail).not.toHaveBeenCalled();
      expect(watchList).not.toHaveBeenCalled();
      rerender();
      expect(loadDetailBySlug).toHaveBeenCalledTimes(1);
    },
  );
  it("does not fall back to id when the preferred slug source is invalid", () => {
    window.history.replaceState({}, "", "/announcement/55?is_official=invalid");
    const { result } = renderHook(
      () => useAnnouncementCenterScript({ slug: "55", id: "90" }),
      { wrapper },
    );
    expect(result.current).toMatchObject({
      isDetail: true,
      status: "ready",
      article: undefined,
    });
    expect(loadDetail).not.toHaveBeenCalled();
    expect(loadDetailBySlug).not.toHaveBeenCalled();
    expect(watchList).not.toHaveBeenCalled();
  });
  it.each([{ id: "55" }, { slug: "", id: "55" }, { id: "custom-id" }])(
    "uses explicit ID lookup for %j",
    (options) => {
      const { result } = renderHook(
        () => useAnnouncementCenterScript(options),
        { wrapper },
      );
      expect(result.current.isDetail).toBe(true);
      expect(getDetail).toHaveBeenCalledWith(options.id);
      expect(loadDetail).toHaveBeenCalledWith(options.id, true);
      expect(loadDetailBySlug).not.toHaveBeenCalled();
      expect(watchList).not.toHaveBeenCalled();
    },
  );
  it.each([{}, { slug: "", id: "" }])(
    "shows the list when no non-empty locator is supplied: %j",
    (options) => {
      const { result } = renderHook(
        () => useAnnouncementCenterScript(options),
        { wrapper },
      );
      expect(result.current.isDetail).toBe(false);
      expect(watchList).toHaveBeenCalled();
      expect(loadDetail).not.toHaveBeenCalled();
      expect(loadDetailBySlug).not.toHaveBeenCalled();
    },
  );
  it("preserves slug loading and retries the same source after failure", () => {
    getDetailBySlug.mockReturnValue({ status: "loading" });
    const { result, rerender } = renderHook(
      () => useAnnouncementCenterScript({ slug: "55", isOfficial: true }),
      { wrapper },
    );
    expect(result.current.status).toBe("loading");
    getDetailBySlug.mockReturnValue({ status: "error" });
    rerender();
    expect(result.current.status).toBe("error");
    loadDetailBySlug.mockClear();
    act(() => result.current.retry());
    expect(loadDetailBySlug).toHaveBeenCalledExactlyOnceWith("55", true, true);
    expect(loadDetail).not.toHaveBeenCalled();
  });
  it.each([
    ["", false],
    ["?is_official=false", false],
    ["?is_official=true", true],
  ])("resolves %s with the expected source", (search, expected) => {
    window.history.replaceState({}, "", `/announcement/release-notes${search}`);
    renderHook(() => useAnnouncementCenterScript({ slug: "release-notes" }), {
      wrapper,
    });
    expect(getDetailBySlug).toHaveBeenCalledWith("release-notes", expected);
    expect(loadDetailBySlug).toHaveBeenCalledWith(
      "release-notes",
      expected,
      true,
    );
    expect(watchList).not.toHaveBeenCalled();
    expect(loadDetail).not.toHaveBeenCalled();
  });
  it.each(["1", "FALSE", "", "null"])("rejects invalid source %s", (source) => {
    window.history.replaceState(
      {},
      "",
      `/announcement/release-notes?is_official=${source}`,
    );
    const { result } = renderHook(
      () => useAnnouncementCenterScript({ slug: "release-notes" }),
      { wrapper },
    );
    expect(result.current).toMatchObject({
      status: "ready",
      article: undefined,
    });
    expect(getDetailBySlug).not.toHaveBeenCalled();
    expect(loadDetailBySlug).not.toHaveBeenCalled();
    expect(loadDetail).not.toHaveBeenCalled();
  });
  it("prefers an explicit source over the URL, including invalid URL values", () => {
    window.history.replaceState(
      {},
      "",
      "/announcement/release-notes?is_official=invalid",
    );
    renderHook(
      () =>
        useAnnouncementCenterScript({
          slug: "release-notes",
          isOfficial: true,
        }),
      { wrapper },
    );
    expect(getDetailBySlug).toHaveBeenCalledWith("release-notes", true);
    expect(loadDetailBySlug).toHaveBeenCalledWith("release-notes", true, true);
    expect(loadDetail).not.toHaveBeenCalled();
  });
  it("keeps ID routes independent of slug source parameters", () => {
    window.history.replaceState({}, "", "/announcement/55?is_official=invalid");
    renderHook(() => useAnnouncementCenterScript({ id: "55" }), {
      wrapper,
    });
    expect(loadDetail).toHaveBeenCalledWith("55", true);
    expect(loadDetailBySlug).not.toHaveBeenCalled();
  });
  it("uses the shared slug link and removes source when returning to the list", () => {
    window.history.replaceState({}, "", "/announcement?category=legal&page=3");
    getList.mockReturnValue({
      articles: [
        { announcement_id: 55, slug: "release-notes", is_official: true },
      ],
      total: 81,
      status: "ready",
    });
    const { result } = renderHook(
      () => useAnnouncementCenterScript({ onRouteChange }),
      { wrapper },
    );
    act(() => result.current.openArticle(55));
    expect(onRouteChange).toHaveBeenLastCalledWith(
      "/announcement/release-notes?category=legal&page=3&is_official=true",
    );
    window.history.replaceState({}, "", onRouteChange.mock.calls[0][0]);
    act(() => result.current.backToList());
    expect(onRouteChange).toHaveBeenLastCalledWith(
      "/announcement?category=legal&page=3",
    );
    act(() => result.current.backToList("all"));
    expect(onRouteChange).toHaveBeenLastCalledWith("/announcement");
  });
});
afterEach(cleanup);

describe("server-paginated announcement page", () => {
  it("uses the route category and page with server total instead of visible row count", () => {
    window.history.replaceState(
      {},
      "",
      "/announcement?category=listing&page=2",
    );
    const { result } = renderHook(
      () => useAnnouncementCenterScript({ onRouteChange }),
      { wrapper },
    );
    expect(watchList).toHaveBeenCalledWith({
      category: "listing",
      page: 2,
      size: 20,
      source: "all",
    });
    expect(result.current).toMatchObject({
      announcements: [],
      page: 2,
      pageTotal: 5,
      count: 81,
    });
  });
  it.each(["0", "-2", "1.5", "NaN", "Infinity", "9007199254740992"])(
    "normalizes invalid page %s to 1",
    (page) => {
      window.history.replaceState({}, "", `/announcement?page=${page}`);
      const { result } = renderHook(() => useAnnouncementCenterScript(), {
        wrapper,
      });
      expect(result.current.page).toBe(1);
      expect(watchList).toHaveBeenCalledWith({
        category: "all",
        page: 1,
        size: 20,
        source: "all",
      });
    },
  );
  it("waits for the server total before correcting an out-of-range route and requests the last page", () => {
    window.history.replaceState(
      {},
      "",
      "/announcement?category=legal&page=99&brokerId=review",
    );
    getList.mockReturnValue({ articles: [], total: 0, status: "loading" });
    const { result, rerender } = renderHook(
      () => useAnnouncementCenterScript({ onRouteChange }),
      { wrapper },
    );
    expect(result.current.page).toBe(99);
    expect(onRouteChange).not.toHaveBeenCalled();
    getList.mockReturnValue({ articles: [], total: 45, status: "ready" });
    rerender();
    expect(onRouteChange).toHaveBeenCalledWith(
      "/announcement?category=legal&page=3&brokerId=review",
    );
    window.history.replaceState({}, "", onRouteChange.mock.calls[0][0]);
    rerender();
    expect(watchList).toHaveBeenLastCalledWith({
      category: "legal",
      page: 3,
      size: 20,
      source: "all",
    });
  });
  it("resets the page when choosing a category and preserves unrelated route parameters", () => {
    window.history.replaceState(
      {},
      "",
      "/announcement?category=legal&page=3&brokerId=review",
    );
    const { result } = renderHook(
      () => useAnnouncementCenterScript({ onRouteChange }),
      { wrapper },
    );
    act(() => result.current.selectCategory("listing"));
    expect(onRouteChange).toHaveBeenLastCalledWith(
      "/announcement?category=listing&brokerId=review",
    );
    act(() => result.current.selectCategory("all"));
    expect(onRouteChange).toHaveBeenLastCalledWith(
      "/announcement?brokerId=review",
    );
  });
  it("retains paging context when entering and leaving an ID detail route", () => {
    window.history.replaceState({}, "", "/announcement?category=legal&page=3");
    const { result } = renderHook(
      () => useAnnouncementCenterScript({ onRouteChange }),
      { wrapper },
    );
    act(() => result.current.openArticle(55));
    expect(onRouteChange).toHaveBeenLastCalledWith(
      "/announcement/55?category=legal&page=3",
    );
    act(() => result.current.backToList());
    expect(onRouteChange).toHaveBeenLastCalledWith(
      "/announcement?category=legal&page=3",
    );
  });
  it("does not mount a list query or correct list pagination on a detail route", () => {
    window.history.replaceState({}, "", "/announcement/55?page=99");
    renderHook(() => useAnnouncementCenterScript({ id: "55", onRouteChange }), {
      wrapper,
    });
    expect(watchList).not.toHaveBeenCalled();
    expect(loadDetail).toHaveBeenCalledWith("55", true);
    expect(onRouteChange).not.toHaveBeenCalled();
  });
});

describe("announcement source filters", () => {
  it.each(["official", "community", "all", "invalid"])(
    "reads source %s and preserves it while navigating",
    (source) => {
      config.widgetConfigs = { announcement: { excludeOfficial: false } };
      window.history.replaceState(
        {},
        "",
        `/announcement?category=legal&page=2&source=${source}&theme=dark`,
      );
      const { result } = renderHook(
        () => useAnnouncementCenterScript({ onRouteChange }),
        { wrapper },
      );
      expect(result.current.sourceFilter).toBe(
        source === "official" || source === "community" ? source : "all",
      );
      expect(watchList).toHaveBeenCalledWith({
        category: "legal",
        page: 2,
        size: 20,
        source: result.current.sourceFilter,
      });
      act(() => result.current.selectCategory("update"));
      expect(onRouteChange).toHaveBeenLastCalledWith(
        `/announcement?category=update&source=${source}&theme=dark`,
      );
      act(() => result.current.selectPage(3));
      expect(onRouteChange).toHaveBeenLastCalledWith(
        `/announcement?category=legal&page=3&source=${source}&theme=dark`,
      );
      act(() => result.current.selectSource("community"));
      expect(onRouteChange).toHaveBeenLastCalledWith(
        "/announcement?category=legal&source=community&theme=dark",
      );
      act(() => result.current.selectSource("all"));
      expect(onRouteChange).toHaveBeenLastCalledWith(
        "/announcement?category=legal&theme=dark",
      );
    },
  );
  it("keeps the list source separate from the article source on detail round trips", () => {
    window.history.replaceState(
      {},
      "",
      "/announcement?source=community&category=legal&page=2",
    );
    getList.mockReturnValue({
      articles: [{ announcement_id: 55, slug: "release", is_official: true }],
      total: 41,
      status: "ready",
    });
    const { result, rerender } = renderHook(
      ({ slug }: { slug?: string }) =>
        useAnnouncementCenterScript({ slug, onRouteChange }),
      { wrapper, initialProps: { slug: undefined as string | undefined } },
    );
    act(() => result.current.openArticle(55));
    expect(onRouteChange).toHaveBeenLastCalledWith(
      "/announcement/release?source=community&category=legal&page=2&is_official=true",
    );
    window.history.replaceState({}, "", onRouteChange.mock.lastCall![0]);
    rerender({ slug: "release" });
    expect(getDetailBySlug).toHaveBeenLastCalledWith("release", true);
    act(() => result.current.backToList());
    expect(onRouteChange).toHaveBeenLastCalledWith(
      "/announcement?source=community&category=legal&page=2",
    );
  });
});

describe("announcement source badge visibility", () => {
  it("defaults to visible and follows changes to the official announcement config", () => {
    const { result, rerender } = renderHook(
      () => useAnnouncementCenterScript(),
      { wrapper },
    );
    expect(result.current.showSourceBadge).toBe(true);
    expect(result.current.showSourceFilter).toBe(true);
    config.widgetConfigs = { announcement: { excludeOfficial: true } };
    rerender();
    expect(result.current.showSourceBadge).toBe(false);
    expect(result.current.showSourceFilter).toBe(false);
    config.widgetConfigs = { announcement: { excludeOfficial: false } };
    rerender();
    expect(result.current.showSourceBadge).toBe(true);
    expect(result.current.showSourceFilter).toBe(true);
  });
});

describe("hidden announcement source filters", () => {
  it.each(["official", "community"])(
    "ignores source=%s when official announcements are excluded",
    (source) => {
      window.history.replaceState({}, "", `/announcement?source=${source}`);
      config.widgetConfigs = { announcement: { excludeOfficial: true } };
      const { result, rerender } = renderHook(
        () => useAnnouncementCenterScript(),
        { wrapper },
      );
      expect(result.current.sourceFilter).toBe("all");
      expect(getList).toHaveBeenLastCalledWith({
        category: "all",
        page: 1,
        size: 20,
        source: "all",
      });
      config.widgetConfigs = { announcement: { excludeOfficial: false } };
      rerender();
      expect(result.current.sourceFilter).toBe(source);
      expect(result.current.showSourceFilter).toBe(true);
    },
  );
});

describe("effective announcement page size", () => {
  it("calculates pages and corrects out-of-range URLs using the server page size", () => {
    window.history.replaceState({}, "", "/announcement?page=10");
    getList.mockReturnValue({
      articles: [],
      total: 81,
      meta: { total: 81, records_per_page: 10, current_page: 10 },
      status: "ready",
    });
    const { result } = renderHook(
      () => useAnnouncementCenterScript({ onRouteChange }),
      { wrapper },
    );
    expect(result.current.pageTotal).toBe(9);
    expect(onRouteChange).toHaveBeenLastCalledWith("/announcement?page=9");
  });
});

describe("announcement pagination URL authority", () => {
  it("keeps URL pages authoritative when navigating and refreshing", () => {
    window.history.replaceState(
      {},
      "",
      "/announcement?category=legal&page=4&theme=dark",
    );
    getList.mockReturnValue({
      articles: [],
      total: 81,
      meta: { total: 81, records_per_page: 10, current_page: 1 },
      status: "ready",
    });
    const { result, rerender, unmount } = renderHook(
      () => useAnnouncementCenterScript({ onRouteChange }),
      { wrapper },
    );
    expect(result.current.page).toBe(4);
    expect(result.current.pageTotal).toBe(9);
    expect(onRouteChange).not.toHaveBeenCalled();
    act(() => result.current.selectPage(6));
    expect(onRouteChange).toHaveBeenLastCalledWith(
      "/announcement?category=legal&page=6&theme=dark",
    );
    window.history.replaceState({}, "", onRouteChange.mock.calls[0][0]);
    rerender();
    expect(result.current.page).toBe(6);
    expect(watchList).toHaveBeenLastCalledWith({
      category: "legal",
      page: 6,
      size: 20,
      source: "all",
    });
    unmount();
    const refreshed = renderHook(() => useAnnouncementCenterScript(), {
      wrapper,
    });
    expect(refreshed.result.current.page).toBe(6);
  });
  it.each(["loading", "error", "ready"] as const)(
    "corrects empty out-of-range pages only when ready: %s",
    (status) => {
      window.history.replaceState(
        {},
        "",
        "/announcement?category=legal&page=3&theme=dark",
      );
      getList.mockReturnValue({
        articles: [],
        total: 0,
        meta: { total: 0, records_per_page: 0, current_page: 3 },
        status,
      });
      const { result } = renderHook(
        () => useAnnouncementCenterScript({ onRouteChange }),
        { wrapper },
      );
      expect(result.current.pageTotal).toBe(1);
      if (status === "ready")
        expect(onRouteChange).toHaveBeenLastCalledWith(
          "/announcement?category=legal&theme=dark",
        );
      else expect(onRouteChange).not.toHaveBeenCalled();
    },
  );
});
