// @vitest-environment jsdom
import { StrictMode, type PropsWithChildren } from "react";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAnnouncement } from "../hooks/useAnnouncement";
import { useMaintenanceAnnouncement } from "../hooks/useMaintenanceAnnouncement";
import {
  AnnouncementArticlesContext,
  useAnnouncementArticles,
} from "./context";
import { localizeAnnouncement, localizeArticle } from "./model";
import { AnnouncementProvider } from "./provider";
import type { AnnouncementArticle, AnnouncementListRow } from "./types";
import { useAnnouncementDetail } from "./useAnnouncementDetail";
import { useAnnouncementList } from "./useAnnouncementList";

const fixture = vi.hoisted(() => ({
  brokerId: "a" as string | undefined,
  widgetConfigs: undefined as
    | undefined
    | { announcement?: { excludeOfficial?: boolean } },
  apiBaseUrl: "https://api.example",
  locale: "en",
  markets: [{ symbol: "PERP_BTC_USDC" }],
  maintenance: {} as {
    startTime?: number;
    endTime?: number;
    status?: number;
    brokerName?: string;
  },
  context: {} as {
    dataAdapter?: { announcementList: (data: unknown[]) => unknown[] };
  },
  list: vi.fn(),
  active: vi.fn(),
  version: 10,
  detail: vi.fn(),
  handlers: new Map<string, (message: unknown) => void>(),
  connection: undefined as undefined | ((event: unknown) => void),
  ws: { subscribe: vi.fn(), on: vi.fn(), off: vi.fn() },
}));
vi.mock("@orderly.network/hooks", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@orderly.network/hooks")>();
  return {
    ...actual,
    useConfig: (key: string) =>
      key === "brokerId"
        ? fixture.brokerId
        : key === "apiBaseUrl"
          ? fixture.apiBaseUrl
          : "Broker A",
    useLazyQuery: (url: string) => ({
      trigger: async (params?: unknown) => {
        if (url?.includes("/detail")) return fixture.detail(url, params);
        if (url?.includes("/active")) return fixture.active(url, params);
        return fixture.list(url, params);
      },
    }),
    useMarketList: () => fixture.markets,
    useOrderlyContext: () => fixture.context,
    useWS: () => fixture.ws,
    useMaintenanceStatus: () => fixture.maintenance,
  };
});
vi.mock("@orderly.network/i18n", () => ({
  useTranslation: () => ({
    i18n: { language: fixture.locale },
    t: (key: string) => key,
  }),
}));
vi.mock("@orderly.network/ui", () => ({}));
vi.mock("@orderly.network/react-app", () => ({
  useAppContext: () => ({
    widgetConfigs: fixture.widgetConfigs,
    setShowAnnouncement: () => {},
  }),
}));

const row = (id = 1, updated_time = 10): AnnouncementListRow => ({
  announcement_id: id,
  updated_time,
  published_time: 1,
  category: "CAMPAIGN",
  is_official: false,
  notification_card_end_time: Date.now() + 60000,
  translations: {
    en: { title: "English title" },
    ja: { title: "日本語タイトル" },
  },
});
const full = (id = 1, updated_time = 10): AnnouncementArticle => ({
  ...row(id, updated_time),
  is_official: false,
  translations: {
    en: { title: "English title", content: "English body" },
    ja: { title: "日本語タイトル", content: "日本語本文" },
  },
});
const response = (rows = [row()]) => ({
  rows,
  total: rows.length,
  last_updated_time: Math.max(0, ...rows.map((item) => item.updated_time)),
});
const unreadKey = (broker: string | null = "a") =>
  `orderly_announcement_unread:${JSON.stringify(broker)}`;
const wrapper = ({ children }: PropsWithChildren) => (
  <AnnouncementProvider>{children}</AnnouncementProvider>
);
async function settle() {
  await act(async () => {
    await Promise.resolve();
  });
}
async function push(
  id: number,
  updated_time: number,
  topic = "a$announcement",
) {
  fixture.version = updated_time;
  await act(async () => {
    fixture.handlers.get(topic)?.({ announcement_id: id, updated_time });
  });
}
beforeEach(() => {
  localStorage.clear();
  fixture.brokerId = "a";
  fixture.widgetConfigs = undefined;
  fixture.apiBaseUrl = "https://api.example";
  fixture.locale = "en";
  fixture.markets = [{ symbol: "PERP_BTC_USDC" }];
  fixture.context = {};
  fixture.maintenance = {};
  fixture.version = 10;
  fixture.list.mockReset().mockResolvedValue(response());
  fixture.active
    .mockReset()
    .mockImplementation(async () => response([full(1, fixture.version)]));
  fixture.detail
    .mockReset()
    .mockImplementation(async (_url, params) =>
      full(Number(params.announcement_id), fixture.version),
    );
  fixture.handlers.clear();
  fixture.connection = undefined;
  fixture.ws.subscribe
    .mockReset()
    .mockImplementation((topic, { onMessage }) => {
      fixture.handlers.set(topic, onMessage);
      return () => fixture.handlers.delete(topic);
    });
  fixture.ws.on.mockReset().mockImplementation((_event, callback) => {
    fixture.connection = callback;
  });
  fixture.ws.off.mockReset();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("production announcement provider", () => {
  it("reads a direct detail even when the already loaded list has not seen its publication", async () => {
    fixture.list.mockResolvedValue(response([]));
    const { result, rerender } = renderHook(
      ({ id }: { id?: string }) => ({
        source: useAnnouncementArticles(),
        detail: useAnnouncementDetail(id),
      }),
      { wrapper, initialProps: { id: undefined } },
    );
    await settle();
    expect(result.current.source.status).toBe("ready");
    rerender({ id: "1" });
    await settle();
    expect(result.current.detail.article?.content).toBe("English body");
    expect(fixture.detail).toHaveBeenCalledTimes(1);
  });
  it("does not let acknowledging one broker overwrite another broker's concurrent unread state", async () => {
    localStorage.setItem(unreadKey("a"), "true");
    const { result } = renderHook(useAnnouncementArticles, { wrapper });
    await settle();
    // Simulate another tab writing B before A receives that tab's storage event.
    localStorage.setItem(unreadKey("b"), "true");
    act(() => result.current.scaffoldState?.openMessageCenter?.());
    expect(localStorage.getItem(unreadKey("a"))).toBe("false");
    expect(localStorage.getItem(unreadKey("b"))).toBe("true");
  });
  it("reminds for a push whose version was already fetched by foreground recovery", async () => {
    const { result } = renderHook(useAnnouncementArticles, { wrapper });
    await settle();
    fixture.list.mockResolvedValue(response([row(1, 20)]));
    await act(async () => window.dispatchEvent(new Event("focus")));
    expect(result.current.scaffoldState?.hasUnread).toBe(false);
    await push(1, 20);
    expect(result.current.scaffoldState).toMatchObject({
      hasUnread: true,
      showAnnouncement: true,
    });
  });
  it("shares one list and subscription set across nested automatic providers", async () => {
    const nested = ({ children }: PropsWithChildren) => (
      <AnnouncementProvider>
        <AnnouncementProvider>{children}</AnnouncementProvider>
      </AnnouncementProvider>
    );
    const { result } = renderHook(useAnnouncementArticles, { wrapper: nested });
    await settle();
    expect(result.current.articles[0].title).toBe("English title");
    expect(fixture.list).toHaveBeenCalledTimes(1);
    expect(fixture.list).toHaveBeenCalledWith(
      "https://api.example/v2/public/announcement",
      { broker_id: "a", exclude_official: "false", page: "1", size: "5" },
    );
    expect(fixture.ws.subscribe.mock.calls.map(([topic]) => topic)).toEqual([
      "orderly_official$announcement",
      "a$announcement",
    ]);
    expect(fixture.detail).not.toHaveBeenCalled();
    expect(result.current.scaffoldState).toMatchObject({
      hasUnread: false,
      showAnnouncement: false,
    });
  });
  it("localizes list titles without requiring content and falls back whole detail translations", () => {
    expect(localizeAnnouncement(row(), "ja").title).toBe("日本語タイトル");
    const article = full();
    article.translations.ja!.content = " ";
    expect(localizeArticle(article, "ja")).toMatchObject({
      title: "English title",
      content: "English body",
      contentLocale: "en",
    });
  });
  it("loads direct details with broker scope and shares the body with the selected card", async () => {
    const { result } = renderHook(
      () => ({
        value: useAnnouncementArticles(),
        detail: useAnnouncementDetail("1"),
      }),
      { wrapper },
    );
    await settle();
    expect(result.current.detail.article?.content).toBe("English body");
    expect(fixture.detail).toHaveBeenLastCalledWith(
      "https://api.example/v2/public/announcement/detail",
      { announcement_id: "1", broker_id: "a" },
    );
    fixture.detail.mockClear();
    await act(async () =>
      result.current.value.scaffoldState?.onCurrentChange?.(1),
    );
    expect(fixture.detail).not.toHaveBeenCalled();
    expect(result.current.value.scaffoldState?.cardTips?.[0].message).toBe(
      "English body",
    );
  });
  it("opens only after a publish push and keeps unread when cards close", async () => {
    const { result } = renderHook(useAnnouncementArticles, { wrapper });
    await settle();
    fixture.list.mockResolvedValue(response([row(1, 20)]));
    await push(1, 20);
    expect(result.current.scaffoldState).toMatchObject({
      hasUnread: true,
      showAnnouncement: true,
    });
    act(() => result.current.scaffoldState?.closeTips());
    expect(result.current.scaffoldState).toMatchObject({
      hasUnread: true,
      showAnnouncement: false,
    });
    act(() => result.current.scaffoldState?.openMessageCenter?.());
    expect(result.current.scaffoldState).toMatchObject({
      hasUnread: false,
      showAnnouncement: false,
    });
    await push(1, 20);
    expect(result.current.scaffoldState).toMatchObject({
      hasUnread: false,
      showAnnouncement: false,
    });
  });
  it("saves per-broker unread and responds to another tab without reopening local cards", async () => {
    localStorage.setItem(unreadKey("a"), "true");
    localStorage.setItem(unreadKey("b"), "false");
    const { result, rerender } = renderHook(useAnnouncementArticles, {
      wrapper,
    });
    await settle();
    expect(result.current.scaffoldState?.hasUnread).toBe(true);
    act(() => {
      localStorage.setItem(unreadKey("a"), "false");
      localStorage.setItem(unreadKey("b"), "true");
      window.dispatchEvent(
        new StorageEvent("storage", { key: unreadKey("a") }),
      );
    });
    expect(result.current.scaffoldState).toMatchObject({
      hasUnread: false,
      showAnnouncement: false,
    });
    fixture.brokerId = "b";
    rerender();
    expect(result.current.articles).toEqual([]);
    expect(result.current.scaffoldState?.hasUnread).toBe(true);
    await settle();
    expect(fixture.handlers.has("a$announcement")).toBe(false);
    expect(fixture.handlers.has("b$announcement")).toBe(true);
  });
  it("clears old content immediately on broker and environment changes", async () => {
    const { result, rerender } = renderHook(useAnnouncementArticles, {
      wrapper,
    });
    await settle();
    fixture.apiBaseUrl = "https://other.example";
    fixture.list.mockImplementation(() => new Promise(() => {}));
    rerender();
    expect(result.current.articles).toEqual([]);
    expect(result.current.status).toBe("loading");
    expect(fixture.list).toHaveBeenLastCalledWith(
      "https://other.example/v2/public/announcement",
      { broker_id: "a", exclude_official: "false", page: "1", size: "5" },
    );
  });
  it("applies widget configuration changes to requests and subscriptions", async () => {
    const { rerender } = renderHook(useAnnouncementArticles, { wrapper });
    await settle();
    expect(fixture.handlers.has("orderly_official$announcement")).toBe(true);

    fixture.widgetConfigs = { announcement: { excludeOfficial: true } };
    rerender();
    await settle();
    expect(fixture.list).toHaveBeenLastCalledWith(
      "https://api.example/v2/public/announcement",
      { broker_id: "a", exclude_official: "true", page: "1", size: "5" },
    );
    expect(fixture.handlers.has("orderly_official$announcement")).toBe(false);
    expect(fixture.handlers.has("a$announcement")).toBe(true);

    fixture.widgetConfigs = undefined;
    rerender();
    await settle();
    expect(fixture.list).toHaveBeenLastCalledWith(
      "https://api.example/v2/public/announcement",
      { broker_id: "a", exclude_official: "false", page: "1", size: "5" },
    );
    expect(fixture.handlers.has("orderly_official$announcement")).toBe(true);
  });
  it.each(["shared", "nested"])(
    "uses widget configuration for bell, cards, page and detail with a %s provider",
    async (mode) => {
      fixture.widgetConfigs = { announcement: { excludeOfficial: true } };
      const officialRow = { ...row(2), is_official: true };
      const officialArticle = { ...full(2), is_official: true };
      fixture.list.mockResolvedValue(response([row(), officialRow]));
      fixture.active.mockResolvedValue(response([full(), officialArticle]));
      fixture.detail.mockResolvedValue(officialArticle);
      const nested = ({ children }: PropsWithChildren) => (
        <AnnouncementProvider>
          <AnnouncementProvider>{children}</AnnouncementProvider>
        </AnnouncementProvider>
      );
      const { result } = renderHook(
        () => ({
          source: useAnnouncementArticles(),
          cards: useAnnouncement(),
          page: useAnnouncementList({ page: 2, size: 20 }),
          detail: useAnnouncementDetail("2"),
        }),
        { wrapper: mode === "nested" ? nested : wrapper },
      );
      await settle();
      expect(
        result.current.source.articles.map((item) => item.announcement_id),
      ).toEqual([1]);
      expect(
        result.current.cards.cardTips?.map((item) => item.announcement_id),
      ).toEqual([1]);
      expect(
        result.current.page.articles.map((item) => item.announcement_id),
      ).toEqual([1]);
      expect(result.current.detail.article).toBeUndefined();
      expect(fixture.list).toHaveBeenCalledWith(
        "https://api.example/v2/public/announcement",
        { broker_id: "a", exclude_official: "true", page: "2", size: "20" },
      );
      expect(fixture.active).toHaveBeenCalledTimes(1);
      expect(fixture.active.mock.calls[0][1]).toMatchObject({
        broker_id: "a",
        exclude_official: "true",
      });
      expect(fixture.handlers.has("orderly_official$announcement")).toBe(false);
    },
  );
  it("uses widget configuration for standalone announcement hooks", async () => {
    fixture.widgetConfigs = { announcement: { excludeOfficial: true } };
    fixture.list.mockResolvedValue(response([{ ...row(), is_official: true }]));
    fixture.active.mockResolvedValue(
      response([{ ...full(), is_official: true }]),
    );
    const { result } = renderHook(() => useAnnouncement());
    await settle();
    expect(result.current.tips).toEqual([]);
    expect(result.current.cardTips).toEqual([]);
    expect(fixture.list.mock.calls[0][1]).toMatchObject({
      broker_id: "a",
      exclude_official: "true",
    });
    expect(fixture.active.mock.calls[0][1]).toMatchObject({
      broker_id: "a",
      exclude_official: "true",
    });
    expect(fixture.handlers.has("orderly_official$announcement")).toBe(false);
    expect(fixture.handlers.has("a$announcement")).toBe(true);
  });
  it("excludes official details even if the detail endpoint returns one", async () => {
    fixture.widgetConfigs = { announcement: { excludeOfficial: true } };
    fixture.detail.mockResolvedValue({ ...full(), is_official: true });
    const { result } = renderHook(
      () => ({
        detail: useAnnouncementDetail("1"),
        value: useAnnouncementArticles(),
      }),
      { wrapper },
    );
    await settle();
    expect(result.current.detail.article).toBeUndefined();
    expect(result.current.detail.status).toBe("ready");
    expect(fixture.handlers.has("orderly_official$announcement")).toBe(false);
    expect(fixture.detail.mock.calls[0][1]).not.toHaveProperty(
      "exclude_official",
    );
  });
  it("filters listings by English tickers across lists, cards and direct details", async () => {
    const listing = {
      ...row(),
      category: "LISTINGS" as const,
      translations: {
        en: { title: "$BTC and $UNKNOWN listing" },
        ja: { title: "Other title" },
      },
    };
    fixture.list.mockResolvedValue(response([listing]));
    fixture.active.mockResolvedValue(response([]));
    fixture.detail.mockResolvedValue({
      ...listing,
      is_official: false,
      translations: {
        en: { title: "$BTC and $UNKNOWN listing", content: "Body" },
      },
    });
    const { result } = renderHook(
      () => ({
        value: useAnnouncementArticles(),
        detail: useAnnouncementDetail("1"),
      }),
      { wrapper },
    );
    await settle();
    expect(result.current.value.articles).toEqual([]);
    expect(result.current.value.scaffoldState?.cardTips).toEqual([]);
    expect(result.current.detail.article).toBeUndefined();
  });
  it("refreshes mounted detail after an edit and removes its body on unpublish", async () => {
    const { result } = renderHook(
      () => ({
        value: useAnnouncementArticles(),
        detail: useAnnouncementDetail("1"),
      }),
      { wrapper },
    );
    await settle();
    fixture.list.mockResolvedValue(response([row(1, 20)]));
    fixture.detail.mockResolvedValue({
      ...full(1, 20),
      translations: { en: { title: "Changed", content: "Updated body" } },
    });
    await push(1, 20);
    expect(result.current.detail.article?.content).toBe("Updated body");
    fixture.list.mockResolvedValue(response([]));
    fixture.active.mockResolvedValue(response([]));
    fixture.detail.mockRejectedValue({ status: 404 });
    await push(1, 30);
    expect(result.current.detail.article).toBeUndefined();
    expect(result.current.detail.status).toBe("ready");
  });
  it("revalidates on public reconnect, foreground, online and hourly ticks without reminding", async () => {
    vi.useFakeTimers();
    const { result } = renderHook(useAnnouncementArticles, { wrapper });
    await settle();
    await act(async () =>
      fixture.connection?.({ type: "open", isPrivate: true }),
    );
    expect(fixture.list).toHaveBeenCalledTimes(1);
    await act(async () =>
      fixture.connection?.({
        type: "open",
        isPrivate: false,
        isReconnect: true,
      }),
    );
    await act(async () => window.dispatchEvent(new Event("focus")));
    await act(async () => window.dispatchEvent(new Event("online")));
    await act(async () =>
      document.dispatchEvent(new Event("visibilitychange")),
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(60 * 60 * 1000);
    });
    expect(fixture.list).toHaveBeenCalledTimes(6);
    expect(result.current.scaffoldState).toMatchObject({
      hasUnread: false,
      showAnnouncement: false,
    });
  });
  it("cleans up subscriptions, timers and connection listeners", async () => {
    vi.useFakeTimers();
    const { unmount } = renderHook(useAnnouncementArticles, { wrapper });
    await settle();
    const connection = fixture.connection;
    unmount();
    expect(fixture.handlers.size).toBe(0);
    expect(fixture.ws.off).toHaveBeenCalledWith("status:change", connection);
    expect(vi.getTimerCount()).toBe(0);
  });
  it("retains the dataAdapter customization point", async () => {
    fixture.context = {
      dataAdapter: { announcementList: (rows) => [row(9), ...rows] },
    };
    const { result } = renderHook(useAnnouncementArticles, { wrapper });
    await settle();
    expect(result.current.articles.map((item) => item.announcement_id)).toEqual(
      [9, 1],
    );
  });
  it("reapplies an updated dataAdapter without waiting for a push or hourly refresh", async () => {
    const { result, rerender } = renderHook(useAnnouncementArticles, {
      wrapper,
    });
    await settle();
    expect(result.current.articles).toHaveLength(1);
    fixture.context = { dataAdapter: { announcementList: () => [] } };
    rerender();
    await settle();
    expect(result.current.articles).toEqual([]);
    expect(result.current.scaffoldState?.tips).toEqual([]);
  });
  it("remains usable after StrictMode's effect cleanup and restart", async () => {
    const strict = ({ children }: PropsWithChildren) => (
      <StrictMode>
        <AnnouncementProvider>{children}</AnnouncementProvider>
      </StrictMode>
    );
    const { result } = renderHook(useAnnouncementArticles, { wrapper: strict });
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.articles).toHaveLength(1);
  });
  it("does not request or subscribe when an external article source owns the scope", async () => {
    const value = {
      articles: [],
      status: "ready" as const,
      refresh: vi.fn(),
      retry: vi.fn(),
    };
    const external = ({ children }: PropsWithChildren) => (
      <AnnouncementArticlesContext.Provider value={value}>
        <AnnouncementProvider>{children}</AnnouncementProvider>
      </AnnouncementArticlesContext.Provider>
    );
    renderHook(useAnnouncementArticles, { wrapper: external });
    await settle();
    expect(fixture.list).not.toHaveBeenCalled();
    expect(fixture.ws.subscribe).not.toHaveBeenCalled();
  });
});

describe("legacy maintenance source", () => {
  it("includes maintenance in the public hook's reading list and expires only ordinary cards", async () => {
    vi.useFakeTimers();
    fixture.maintenance = {
      startTime: 10,
      endTime: 20,
      status: 0,
      brokerName: "Broker",
    };
    const { result } = renderHook(() => useAnnouncement(), { wrapper });
    await settle();
    expect(result.current.tips.map((item) => item.announcement_id)).toEqual([
      "-1",
      1,
    ]);
    expect(
      result.current.cardTips?.some((item) => item.announcement_id === "-1"),
    ).toBe(true);
    act(() => result.current.closeTips());
    expect(result.current.showAnnouncement).toBe(false);
    expect(result.current.tips).toHaveLength(2);
    fixture.list.mockResolvedValue(
      response([
        { ...row(1, 20), notification_card_end_time: Date.now() + 1000 },
      ]),
    );
    fixture.active.mockResolvedValue(
      response([
        { ...full(1, 20), notification_card_end_time: Date.now() + 1000 },
      ]),
    );
    await push(1, 20);
    expect(result.current.showAnnouncement).toBe(true);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(
      result.current.cardTips?.map((item) => item.announcement_id),
    ).toEqual(["-1"]);
    expect(result.current.tips.map((item) => item.announcement_id)).toEqual([
      1,
      "-1",
    ]);
    expect(result.current.hasUnread).toBe(true);
    act(() => result.current.openMessageCenter?.());
    expect(result.current.showAnnouncement).toBe(false);
    expect(result.current.hasUnread).toBe(false);
    expect(result.current.tips).toHaveLength(2);
    expect(fixture.ws.subscribe).toHaveBeenCalledTimes(2);
  });
  it("keeps past maintenance times at status zero and clears only when a time is reset", async () => {
    fixture.maintenance = {
      startTime: 10,
      endTime: 20,
      status: 0,
      brokerName: "Broker",
    };
    const { result, rerender } = renderHook(useMaintenanceAnnouncement);
    await settle();
    expect(result.current.tips).toHaveLength(1);
    expect(result.current.showAnnouncement).toBe(true);
    act(() => result.current.closeTips());
    expect(result.current.tips).toHaveLength(1);
    expect(result.current.showAnnouncement).toBe(false);
    fixture.maintenance = {
      ...fixture.maintenance,
      startTime: 30,
      endTime: 40,
    };
    rerender();
    await settle();
    expect(result.current.showAnnouncement).toBe(true);
    fixture.maintenance = { ...fixture.maintenance, startTime: 0 };
    rerender();
    expect(result.current.tips).toEqual([]);
    expect(fixture.list).not.toHaveBeenCalled();
    expect(fixture.ws.subscribe).not.toHaveBeenCalled();
  });
});

describe("v1.5 public reads", () => {
  it("requests server pages separately from the bell and preserves total after market filtering", async () => {
    fixture.list.mockImplementation(async (_url, params) =>
      params.size === "5"
        ? response([row(9)])
        : {
            ...response([
              {
                ...row(22),
                category: "LISTINGS",
                translations: { en: { title: "$UNKNOWN listing" } },
              },
            ]),
            total: 81,
            last_updated_time: 900,
          },
    );
    const { result } = renderHook(
      () => useAnnouncementList({ category: "listing", page: 2, size: 20 }),
      { wrapper },
    );
    await settle();
    expect(fixture.list).toHaveBeenCalledWith(
      "https://api.example/v2/public/announcement",
      {
        broker_id: "a",
        exclude_official: "false",
        category: "LISTINGS",
        page: "2",
        size: "20",
      },
    );
    expect(result.current).toMatchObject({
      articles: [],
      total: 81,
      status: "ready",
    });
    expect(fixture.active).toHaveBeenCalledWith(
      "https://api.example/v2/public/announcement/active",
      {
        broker_id: "a",
        exclude_official: "false",
        locale: "en",
      },
    );
  });
  it("keeps server totals when an adapter injects or removes current-page rows", async () => {
    fixture.list.mockResolvedValue({ ...response([row(1)]), total: 81 });
    fixture.context = {
      dataAdapter: { announcementList: () => [row(99), row(98)] },
    };
    const { result } = renderHook(() => useAnnouncementList({ page: 2 }), {
      wrapper,
    });
    await settle();
    expect(result.current.total).toBe(81);
    expect(result.current.articles.map((item) => item.announcement_id)).toEqual(
      [99, 98],
    );
  });
  it("does not let a late page or category response overwrite the selected query", async () => {
    let finish!: (data: ReturnType<typeof response>) => void;
    fixture.list.mockImplementation(async (_url, params) =>
      params.category === "CAMPAIGN"
        ? new Promise((resolve) => {
            finish = resolve;
          })
        : response([row(33)]),
    );
    const { result, rerender } = renderHook(
      ({ category }) => useAnnouncementList({ category, page: 2 }),
      {
        wrapper,
        initialProps: { category: "campaign" as "campaign" | "legal" },
      },
    );
    await settle();
    rerender({ category: "legal" });
    await settle();
    expect(result.current.articles[0].announcement_id).toBe(33);
    await act(async () => finish(response([row(11)])));
    expect(result.current.articles[0].announcement_id).toBe(33);
  });
  it("shares one page request for multiple consumers and does not refresh unmounted queries", async () => {
    const { result, rerender, unmount } = renderHook(
      ({ enabled }) => ({
        a: useAnnouncementList({ page: 2 }, enabled),
        b: useAnnouncementList({ page: 2 }, enabled),
      }),
      { wrapper, initialProps: { enabled: true } },
    );
    await settle();
    expect(result.current.a.articles).toEqual(result.current.b.articles);
    expect(
      fixture.list.mock.calls.filter(([, params]) => params.size === "20"),
    ).toHaveLength(1);
    rerender({ enabled: false });
    await push(1, 20);
    expect(
      fixture.list.mock.calls.filter(([, params]) => params.size === "20"),
    ).toHaveLength(1);
    unmount();
    expect(fixture.handlers.size).toBe(0);
  });
  it("loads more than ten card bodies in one active request without detail fetches", async () => {
    fixture.active.mockResolvedValue(
      response(Array.from({ length: 15 }, (_, id) => full(id + 1))),
    );
    const { result } = renderHook(useAnnouncementArticles, { wrapper });
    await settle();
    expect(result.current.scaffoldState?.cardTips).toHaveLength(15);
    expect(
      result.current.scaffoldState?.cardTips?.every(
        (item) => item.message === "English body",
      ),
    ).toBe(true);
    for (let id = 1; id <= 15; id++)
      act(() => result.current.scaffoldState?.onCurrentChange?.(id));
    expect(fixture.active).toHaveBeenCalledTimes(1);
    expect(fixture.detail).not.toHaveBeenCalled();
  });
  it("refetches active for language changes and ignores the previous language response", async () => {
    let english!: (data: ReturnType<typeof response>) => void;
    fixture.active.mockImplementation(async (_url, params) =>
      params.locale === "en"
        ? new Promise((resolve) => {
            english = resolve;
          })
        : response([full()]),
    );
    const { result, rerender } = renderHook(useAnnouncementArticles, {
      wrapper,
    });
    await settle();
    fixture.locale = "ja";
    rerender();
    await settle();
    expect(result.current.scaffoldState?.cardTips?.[0]).toMatchObject({
      title: "日本語タイトル",
      message: "日本語本文",
    });
    await act(async () => english(response([full(99)])));
    expect(result.current.scaffoldState?.cardTips?.[0].announcement_id).toBe(1);
    expect(fixture.list).toHaveBeenCalledTimes(1);
  });
  it("falls back the complete card to English for an incomplete translation", async () => {
    fixture.locale = "ja";
    const incomplete = full();
    incomplete.translations.ja!.content = " ";
    fixture.active.mockResolvedValue(response([incomplete]));
    const { result } = renderHook(useAnnouncementArticles, { wrapper });
    await settle();
    expect(result.current.scaffoldState?.cardTips?.[0]).toMatchObject({
      title: "English title",
      message: "English body",
    });
  });
  it.each(["ar", "tc", "ru", "jp"])(
    "uses English for unsupported content locale %s",
    async (language) => {
      fixture.locale = language;
      renderHook(useAnnouncementArticles, { wrapper });
      await settle();
      expect(fixture.active.mock.calls[0][1].locale).toBe("en");
    },
  );
  it("does not treat active's locale-trimmed translations as a complete detail cache", async () => {
    fixture.active.mockResolvedValue(
      response([{ ...full(), translations: { en: full().translations.en } }]),
    );
    const { result, rerender } = renderHook(
      ({ id }: { id?: string }) => useAnnouncementDetail(id),
      { wrapper, initialProps: { id: undefined } },
    );
    await settle();
    fixture.locale = "ja";
    rerender({ id: "1" });
    await settle();
    expect(result.current.article?.content).toBe("日本語本文");
    expect(fixture.detail).toHaveBeenCalledTimes(1);
  });
  it("keeps other-page direct details after a bell refresh, then removes them on a verified push", async () => {
    fixture.list.mockResolvedValue({ ...response([row(2)]), total: 40 });
    const { result } = renderHook(
      () => ({
        source: useAnnouncementArticles(),
        detail: useAnnouncementDetail("1"),
        page: useAnnouncementList({ page: 2 }),
      }),
      { wrapper },
    );
    await settle();
    await act(async () => result.current.source.refresh());
    expect(result.current.detail.article?.content).toBe("English body");
    fixture.detail.mockRejectedValue({ status: 404 });
    await push(1, 20);
    expect(result.current.detail.article).toBeUndefined();
    expect(result.current.source.scaffoldState?.cardTips).toEqual([]);
    expect(result.current.source.scaffoldState?.hasUnread).toBe(false);
  });
  it("revalidates an open detail on foreground recovery without relying on page membership", async () => {
    const { result } = renderHook(() => useAnnouncementDetail("1"), {
      wrapper,
    });
    await settle();
    fixture.detail.mockRejectedValue({ status: 404 });
    await act(async () => window.dispatchEvent(new Event("focus")));
    expect(result.current.article).toBeUndefined();
    expect(result.current.status).toBe("ready");
  });
  it("paginates custom in-memory contexts without starting a production source", async () => {
    const articles = Array.from({ length: 30 }, (_, index) =>
      localizeArticle(full(index + 1), "en"),
    );
    const custom = ({ children }: PropsWithChildren) => (
      <AnnouncementArticlesContext.Provider
        value={{ articles, status: "ready", refresh: vi.fn(), retry: vi.fn() }}
      >
        {children}
      </AnnouncementArticlesContext.Provider>
    );
    const { result } = renderHook(
      () => useAnnouncementList({ page: 2, size: 20 }),
      { wrapper: custom },
    );
    expect(result.current.total).toBe(30);
    expect(result.current.articles[0].announcement_id).toBe(21);
    expect(fixture.list).not.toHaveBeenCalled();
    expect(fixture.active).not.toHaveBeenCalled();
  });
  it("uses the new reads for a standalone hook without a provider", async () => {
    const { result } = renderHook(() => useAnnouncement());
    await settle();
    expect(result.current.cardTips?.[0].message).toBe("English body");
    expect(fixture.list.mock.calls[0][1]).toMatchObject({
      page: "1",
      size: "5",
    });
    expect(fixture.active).toHaveBeenCalledTimes(1);
    expect(fixture.detail).not.toHaveBeenCalled();
  });
});

describe("active-card loading lifecycle", () => {
  it("preserves an open carousel across an asynchronous language change", async () => {
    const { result, rerender } = renderHook(() => useAnnouncement(), {
      wrapper,
    });
    await settle();
    await push(1, 20);
    expect(result.current.showAnnouncement).toBe(true);
    let finish!: (data: ReturnType<typeof response>) => void;
    fixture.active.mockImplementation(
      async () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    fixture.locale = "ja";
    rerender();
    await settle();
    expect(result.current.cardStatus).toBe("loading");
    await act(async () => finish(response([full(1, 20)])));
    expect(result.current.showAnnouncement).toBe(true);
    expect(result.current.cardTips?.[0].message).toBe("日本語本文");
  });
});

describe("independent page retries", () => {
  it("retries an errored page without refetching the bell or active cards", async () => {
    vi.useFakeTimers();
    let failed = false;
    fixture.list.mockImplementation(async (_url, params) => {
      if (params.size === "20" && !failed) {
        failed = true;
        throw new Error("offline");
      }
      return { ...response([row()]), total: 42 };
    });
    const { result } = renderHook(() => useAnnouncementList({ page: 2 }), {
      wrapper,
    });
    await settle();
    expect(result.current.status).toBe("error");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(result.current).toMatchObject({ status: "ready", total: 42 });
    expect(
      fixture.list.mock.calls.filter(([, params]) => params.size === "5"),
    ).toHaveLength(1);
    expect(fixture.active).toHaveBeenCalledTimes(1);
  });
  it("retries the bell without refetching a healthy page or active cards", async () => {
    const { result } = renderHook(
      () => ({
        source: useAnnouncementArticles(),
        page: useAnnouncementList({ page: 2 }),
      }),
      { wrapper },
    );
    await settle();
    await act(async () => result.current.source.retry());
    expect(
      fixture.list.mock.calls.filter(([, params]) => params.size === "20"),
    ).toHaveLength(1);
    expect(fixture.active).toHaveBeenCalledTimes(1);
    expect(
      fixture.list.mock.calls.filter(([, params]) => params.size === "5"),
    ).toHaveLength(2);
  });
});
