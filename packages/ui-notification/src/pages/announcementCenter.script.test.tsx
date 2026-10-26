// @vitest-environment jsdom
import type { PropsWithChildren } from "react";
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  AnnouncementArticlesContext,
  type AnnouncementArticlesValue,
} from "../articles/context";
import { useAnnouncementCenterScript } from "./announcementCenter.script";

vi.mock("@orderly.network/hooks", () => ({ useConfig: () => "Broker" }));
const getList = vi.fn();
const watchList = vi.fn(() => vi.fn());
const loadDetail = vi.fn();
const onRouteChange = vi.fn();
const value: AnnouncementArticlesValue = {
  articles: [],
  status: "ready",
  refresh: vi.fn(),
  retry: vi.fn(),
  getList,
  watchList,
  loadDetail,
  getDetail: () => ({ status: "ready" }),
};
const wrapper = ({ children }: PropsWithChildren) => (
  <AnnouncementArticlesContext.Provider value={value}>
    {children}
  </AnnouncementArticlesContext.Provider>
);
beforeEach(() => {
  window.history.replaceState({}, "", "/announcement");
  getList
    .mockReset()
    .mockReturnValue({ articles: [], total: 81, status: "ready" });
  watchList.mockClear();
  loadDetail.mockReset();
  onRouteChange.mockReset();
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
    renderHook(
      () =>
        useAnnouncementCenterScript({ announcementId: "55", onRouteChange }),
      { wrapper },
    );
    expect(watchList).not.toHaveBeenCalled();
    expect(loadDetail).toHaveBeenCalledWith("55", true);
    expect(onRouteChange).not.toHaveBeenCalled();
  });
});
