// @vitest-environment jsdom
import type { PropsWithChildren } from "react";
import { cleanup, renderHook, act } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  AnnouncementArticlesContext,
  type AnnouncementArticlesValue,
} from "./context";
import { localizeAnnouncement } from "./model";
import type { AnnouncementListQuery } from "./types";
import { useAnnouncementList } from "./useAnnouncementList";

const articles = [true, false, undefined, true, false].map(
  (is_official, index) =>
    localizeAnnouncement(
      {
        announcement_id: index + 1,
        is_official,
        category: "LEGAL",
        published_time: index,
        updated_time: index,
        translations: { en: { title: `Article ${index}` } },
      },
      "en",
    ),
);
const value: AnnouncementArticlesValue = {
  articles,
  status: "ready",
  retry: vi.fn(),
  refresh: vi.fn(),
};
const wrapper = ({ children }: PropsWithChildren) => (
  <AnnouncementArticlesContext.Provider value={value}>
    {children}
  </AnnouncementArticlesContext.Provider>
);
afterEach(cleanup);

describe("announcement list source filtering", () => {
  it.each([
    ["all", 5, [1, 2]],
    ["official", 2, [1, 4]],
    ["community", 2, [2, 5]],
  ] as const)(
    "filters %s before pagination and excludes unknown sources from named filters",
    (source, total, ids) => {
      const { result } = renderHook(
        () =>
          useAnnouncementList({ source, category: "legal", page: 1, size: 2 }),
        { wrapper },
      );
      expect(result.current.total).toBe(total);
      expect(result.current.articles.map((row) => row.announcement_id)).toEqual(
        ids,
      );
    },
  );
  it("combines category and source and keeps the filter on retry", () => {
    const retryList = vi.fn();
    const watchList = vi.fn(() => vi.fn());
    const getList = vi.fn(() => ({
      articles: [],
      total: 0,
      status: "ready" as const,
    }));
    const sourceValue = { ...value, retryList, watchList, getList };
    const { result, rerender } = renderHook(
      (query: AnnouncementListQuery) => useAnnouncementList(query),
      {
        initialProps: {
          source: "community",
          category: "legal",
          page: 2,
          size: 20,
        } as AnnouncementListQuery,
        wrapper: ({ children }) => (
          <AnnouncementArticlesContext.Provider value={sourceValue}>
            {children}
          </AnnouncementArticlesContext.Provider>
        ),
      },
    );
    act(() => result.current.retry());
    expect(retryList).toHaveBeenCalledWith({
      source: "community",
      category: "legal",
      page: 2,
      size: 20,
    });
    rerender({ source: "official", category: "legal", page: 1, size: 20 });
    expect(watchList).toHaveBeenLastCalledWith({
      source: "official",
      category: "legal",
      page: 1,
      size: 20,
    });
    expect(getList).toHaveBeenLastCalledWith({
      source: "official",
      category: "legal",
      page: 1,
      size: 20,
    });
  });
  it("shows no items when the selected category has no matching source", () => {
    const { result } = renderHook(
      () => useAnnouncementList({ source: "official", category: "listing" }),
      { wrapper },
    );
    expect(result.current.total).toBe(0);
    expect(result.current.articles).toEqual([]);
  });
});
