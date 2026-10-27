import { afterEach, describe, expect, it, vi } from "vitest";
import {
  AnnouncementStore,
  announcementQuery,
  announcementActiveQuery,
  announcementTopics,
  announcementLocale,
  listQueryKey,
} from "./store";
import type {
  AnnouncementActiveResponse,
  AnnouncementArticle,
  AnnouncementListResponse,
  AnnouncementListRow,
} from "./types";

const article = (id = 1, updated_time = 10): AnnouncementArticle => ({
  announcement_id: id,
  updated_time,
  published_time: id,
  category: "CAMPAIGN",
  is_official: true,
  notification_card_end_time: 9999999999999,
  translations: {
    en: { title: "English", content: "Body" },
    ja: { title: "Japanese", content: "Japanese body" },
  },
});
const row = (id = 1, version = 10): AnnouncementListRow => ({
  ...article(id, version),
  translations: { en: { title: "English" }, ja: { title: "Japanese" } },
});
const response = <T extends AnnouncementListRow>(
  rows: T[],
  total = rows.length,
) => ({
  rows,
  total,
  last_updated_time: Math.max(0, ...rows.map((item) => item.updated_time)),
});
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
const stores: AnnouncementStore[] = [];
function harness() {
  const server = { rows: [article()] };
  const list = vi.fn<(query?: unknown) => Promise<AnnouncementListResponse>>(
    async () =>
      response(
        server.rows.map((item) => ({
          ...item,
          translations: { en: { title: item.translations.en.title } },
        })),
      ),
  );
  const active = vi.fn<
    (locale?: unknown) => Promise<AnnouncementActiveResponse>
  >(async () =>
    response(
      server.rows.filter(
        (item) => item.notification_card_end_time! > Date.now(),
      ),
    ),
  );
  const detail = vi.fn(async (id: string) => {
    const found = server.rows.find(
      (item) => String(item.announcement_id) === id,
    );
    if (!found) throw { status: 404 };
    return found;
  });
  const onNotify = vi.fn();
  const detailBySlug = vi.fn(async (slug: string, isOfficial: boolean) => {
    const found = server.rows.find(
      (row) => row.slug === slug && row.is_official === isOfficial,
    );
    if (!found) throw { status: 404 };
    return found;
  });
  const store = new AnnouncementStore({
    brokerId: "a",
    list,
    active,
    detail,
    detailBySlug,
    onNotify,
    visible: () => true,
  });
  stores.push(store);
  return { store, server, list, active, detail, detailBySlug, onNotify };
}
afterEach(() => {
  stores.forEach((store) => store.stop());
  stores.length = 0;
  vi.useRealTimers();
});

describe("announcement source contract", () => {
  it.each([
    [{}, ["orderly_official$announcement"]],
    [{ brokerId: "a" }, ["orderly_official$announcement", "a$announcement"]],
    [{ brokerId: "a", excludeOfficial: true }, ["a$announcement"]],
    [{ excludeOfficial: true }, []],
  ])("selects requested topics for %j", (options, expected) => {
    expect(announcementTopics(options)).toEqual(expected);
  });
  it.each([
    ["all", null],
    ["campaign", "CAMPAIGN"],
    ["listing", "LISTINGS"],
    ["delisting", "DELISTINGS"],
    ["update", "UPDATES"],
    ["legal", "LEGAL"],
    ["others", "OTHERS"],
  ] as const)(
    "encodes category %s and page parameters",
    (category, expected) => {
      const params = new URLSearchParams(
        announcementQuery({
          brokerId: "a & b",
          category,
          page: 2,
          size: 20,
        }).split("?")[1],
      );
      expect(params.get("broker_id")).toBe("a & b");
      expect(params.get("exclude_official")).toBe("false");
      expect(params.get("category")).toBe(expected);
      expect(params.get("page")).toBe("2");
      expect(params.get("size")).toBe("20");
    },
  );
  it("does not add paging to an unspecified query or active request", () => {
    expect(announcementQuery({})).not.toContain("page=");
    const url = announcementActiveQuery(
      { brokerId: "a", excludeOfficial: true },
      "ja",
    );
    expect(url).toBe(
      "/v2/public/announcement/active?broker_id=a&exclude_official=true&locale=ja",
    );
    expect(url).not.toContain("page=");
  });
  it.each([
    ["ja-JP", "ja"],
    ["zh_CN", "zh"],
    ["fr", "fr"],
    ["jp", "en"],
    ["tc", "en"],
    ["ar", "en"],
  ])("normalizes %s to %s", (input, expected) => {
    expect(announcementLocale(input)).toBe(expected);
  });
  it("does not request either source when both are disabled", async () => {
    const list = vi.fn(),
      active = vi.fn(),
      detail = vi.fn();
    const store = new AnnouncementStore({
      excludeOfficial: true,
      list,
      active,
      detail,
      detailBySlug: vi.fn(),
      visible: () => true,
      onNotify: vi.fn(),
    });
    stores.push(store);
    await store.refresh();
    await store.loadDetail("1");
    expect(list).not.toHaveBeenCalled();
    expect(active).not.toHaveBeenCalled();
    expect(detail).not.toHaveBeenCalled();
    expect(store.getSnapshot()).toMatchObject({
      rows: [],
      status: "ready",
      lastUpdatedTime: 0,
    });
  });
});

describe("independent public views", () => {
  it("initializes the five-row bell and active cards silently without detail requests", async () => {
    const { store, list, active, detail, onNotify } = harness();
    await store.refresh();
    expect(list).toHaveBeenCalledWith({ page: 1, size: 5 });
    expect(active).toHaveBeenCalledWith("en");
    expect(store.getSnapshot()).toMatchObject({
      lastUpdatedTime: 10,
      cardOpen: false,
      status: "ready",
      active: { total: 1, status: "ready" },
    });
    expect(detail).not.toHaveBeenCalled();
    expect(onNotify).not.toHaveBeenCalled();
  });
  it("keeps paging snapshots independent and does not change server totals", async () => {
    const { store, list } = harness();
    const first = deferred<AnnouncementListResponse>();
    list
      .mockReturnValueOnce(first.promise)
      .mockResolvedValue(response([row(22)], 61));
    const stopFirst = store.watchList({ page: 1, size: 20 });
    const stopSecond = store.watchList({
      category: "listing",
      page: 2,
      size: 20,
    });
    await Promise.resolve();
    first.resolve(response([row(1)], 101));
    await first.promise;
    await Promise.resolve();
    expect(
      store.getSnapshot().lists[listQueryKey({ page: 1, size: 20 })],
    ).toMatchObject({ rows: [row(1)], total: 101 });
    expect(
      store.getSnapshot().lists[
        listQueryKey({ category: "listing", page: 2, size: 20 })
      ],
    ).toMatchObject({ rows: [row(22)], total: 61 });
    stopFirst();
    stopSecond();
  });
  it("lets active cards succeed when the bell fails, and retries only the failed resource", async () => {
    vi.useFakeTimers();
    const { store, list, active } = harness();
    list.mockRejectedValueOnce(new Error("offline"));
    await store.refresh();
    expect(store.getSnapshot()).toMatchObject({
      status: "error",
      active: { status: "ready", total: 1 },
    });
    await vi.advanceTimersByTimeAsync(1000);
    expect(store.getSnapshot().status).toBe("ready");
    expect(active).toHaveBeenCalledTimes(1);
  });
  it("discards old locale responses without throwing away list and detail caches", async () => {
    const { store, active } = harness();
    const english =
      deferred<ReturnType<typeof response<AnnouncementArticle>>>();
    active.mockReturnValueOnce(english.promise);
    const reading = store.refresh();
    await store.loadDetail("1");
    store.setLocale("ja");
    await Promise.resolve();
    english.resolve(response([article(9)]));
    await reading;
    expect(store.getSnapshot()).toMatchObject({
      activeLocale: "ja",
      active: { rows: [article(1)] },
    });
    expect(store.getSnapshot().details["1"].article).toEqual(article());
  });
  it("performs a trailing authoritative read when refreshed during an older request", async () => {
    const { store, list } = harness();
    const pending = deferred<AnnouncementListResponse>();
    list
      .mockReturnValueOnce(pending.promise)
      .mockResolvedValue(response([row(2)]));
    const reading = store.refresh();
    void store.refresh();
    pending.resolve(response([row(1)]));
    await reading;
    expect(list).toHaveBeenCalledTimes(2);
    expect(store.getSnapshot().rows[0].announcement_id).toBe(2);
  });
});

describe("push verification", () => {
  it.each([true, false])(
    "handles publication, edit and removal for official=%s",
    async (is_official) => {
      const { store, server, onNotify } = harness();
      server.rows = [];
      await store.refresh();
      server.rows = [{ ...article(1, 10), is_official }];
      store.notify({ announcement_id: 1, updated_time: 10 });
      await store.refresh();
      expect(onNotify).toHaveBeenCalledTimes(1);
      expect(store.getSnapshot().cardOpen).toBe(true);
      store.closeTips();
      server.rows = [{ ...article(1, 20), is_official }];
      store.notify({ announcement_id: 1, updated_time: 20 });
      await store.refresh();
      expect(onNotify).toHaveBeenCalledTimes(2);
      store.closeTips();
      server.rows = [];
      store.notify({ announcement_id: 1, updated_time: 30 });
      await store.refresh();
      expect(store.getSnapshot()).toMatchObject({
        rows: [],
        active: { rows: [] },
        cardOpen: false,
        details: { "1": { status: "ready" } },
      });
      expect(onNotify).toHaveBeenCalledTimes(2);
    },
  );
  it("verifies and reminds for an ID outside the bell and current page", async () => {
    const { store, server, list, onNotify } = harness();
    list.mockResolvedValue(response([row(9)], 100));
    store.watchList({ category: "listing", page: 3, size: 20 });
    await store.refresh();
    server.rows = [article(55, 20)];
    store.notify({ announcement_id: 55, updated_time: 20 });
    await store.refresh();
    expect(onNotify).toHaveBeenCalledTimes(1);
    expect(store.getSnapshot().details["55"].article).toEqual(article(55, 20));
    expect(store.getSnapshot().rows[0].announcement_id).toBe(9);
  });
  it("does not lose a push after a silent read and deduplicates older and duplicate versions", async () => {
    const { store, server, onNotify } = harness();
    server.rows = [article(1, 30)];
    await store.refresh();
    expect(onNotify).not.toHaveBeenCalled();
    store.notify({ announcement_id: 1, updated_time: 20 });
    await store.refresh();
    store.closeTips();
    store.notify({ announcement_id: 1, updated_time: 30 });
    await store.refresh();
    store.notify({ announcement_id: 1, updated_time: 9 });
    await store.refresh();
    expect(onNotify).toHaveBeenCalledTimes(1);
    expect(store.getSnapshot().cardOpen).toBe(false);
  });
  it("retains pending events and backs off when detail has not reached the event version", async () => {
    vi.useFakeTimers();
    const { store, server, detail, onNotify } = harness();
    await store.refresh();
    store.notify({ announcement_id: 1, updated_time: 20 });
    await store.refresh();
    expect(store.getSnapshot().details["1"].status).toBe("error");
    expect(onNotify).not.toHaveBeenCalled();
    expect(detail).toHaveBeenCalledTimes(1);
    server.rows = [article(1, 20)];
    await vi.advanceTimersByTimeAsync(1000);
    expect(onNotify).toHaveBeenCalledTimes(1);
  });
  it("does not acknowledge transient detail failures and retries them", async () => {
    vi.useFakeTimers();
    const { store, detail, onNotify } = harness();
    detail.mockRejectedValueOnce({ status: 503 });
    store.notify({ announcement_id: 1, updated_time: 10 });
    await store.refresh();
    expect(onNotify).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1000);
    expect(onNotify).toHaveBeenCalledTimes(1);
  });
  it("invalidates a pre-event body and merges concurrent verification for the same ID", async () => {
    const { store, server, detail, onNotify } = harness();
    const old = deferred<AnnouncementArticle>();
    detail.mockReturnValueOnce(old.promise);
    const loading = store.loadDetail("1");
    server.rows = [article(1, 20)];
    store.notify({ announcement_id: 1, updated_time: 20 });
    store.notify({ announcement_id: 1, updated_time: 20 });
    await store.refresh();
    old.resolve(article(1, 10));
    await loading;
    expect(detail).toHaveBeenCalledTimes(2);
    expect(store.getSnapshot().details["1"].article?.updated_time).toBe(20);
    expect(onNotify).toHaveBeenCalledTimes(1);
  });
  it("removes confirmed unpublished rows from every cached view and rejects stale resurrection", async () => {
    const { store, server, list, active } = harness();
    store.watchList({ page: 2, size: 20 });
    await store.refresh();
    server.rows = [];
    // Simulate lagging caches after the uncached detail endpoint confirms removal.
    list.mockResolvedValue(response([row()]));
    active.mockResolvedValue(response([article()]));
    store.notify({ announcement_id: 1, updated_time: 20 });
    await store.refresh();
    await store.refresh();
    expect(store.getSnapshot().rows).toEqual([]);
    expect(store.getSnapshot().active.rows).toEqual([]);
    expect(
      store.getSnapshot().lists[listQueryKey({ page: 2, size: 20 })].rows,
    ).toEqual([]);
    expect(store.getSnapshot().details["1"]).toEqual({ status: "ready" });
    server.rows = [article(1, 30)];
    list.mockResolvedValue(response([row(1, 30)]));
    active.mockResolvedValue(response([article(1, 30)]));
    store.notify({ announcement_id: 1, updated_time: 30 });
    await store.refresh();
    expect(store.getSnapshot().rows).toHaveLength(1);
  });
  it("ignores responses and reminders after disposal", async () => {
    const { store, list, onNotify } = harness();
    const pending = deferred<AnnouncementListResponse>();
    list.mockReturnValue(pending.promise);
    store.notify({ announcement_id: 1, updated_time: 10 });
    store.stop();
    pending.resolve(response([row()]));
    await pending.promise;
    expect(store.getSnapshot().rows).toEqual([]);
    expect(onNotify).not.toHaveBeenCalled();
  });
});

describe("detail cache", () => {
  it("deduplicates reads and invalidates a cached body when a page sees a newer version", async () => {
    const { store, server, detail } = harness();
    await store.refresh();
    await Promise.all([store.loadDetail("1"), store.loadDetail("1")]);
    expect(detail).toHaveBeenCalledTimes(1);
    server.rows = [article(1, 20)];
    await store.refresh();
    expect(store.getSnapshot().details["1"]).toEqual({ status: "loading" });
  });
  it("retains details missing from paginated results and active cards", async () => {
    const { store, list, active } = harness();
    await store.loadDetail("1");
    list.mockResolvedValue(response([], 50));
    active.mockResolvedValue(response([]));
    await store.refresh();
    expect(store.getSnapshot().details["1"].article).toEqual(article());
  });
  it("loads direct links while an older empty list is in flight", async () => {
    const { store, list } = harness();
    const pending = deferred<AnnouncementListResponse>();
    list.mockReturnValue(pending.promise);
    const reading = store.refresh();
    await store.loadDetail("1", true);
    pending.resolve(response([]));
    await reading;
    expect(store.getSnapshot().details["1"].article).toEqual(article());
  });
  it("distinguishes not found from transient failures and allows retry", async () => {
    const { store, detail } = harness();
    detail.mockRejectedValueOnce({ status: 404 });
    await store.loadDetail("1");
    expect(store.getSnapshot().details["1"]).toEqual({ status: "ready" });
    detail.mockRejectedValueOnce({ status: 503 });
    await store.loadDetail("1", true);
    expect(store.getSnapshot().details["1"]).toEqual({ status: "error" });
    await store.loadDetail("1", true);
    expect(store.getSnapshot().details["1"].article).toEqual(article());
  });
  it("recovery invalidates missed detail updates silently", async () => {
    const { store, onNotify } = harness();
    await store.loadDetail("1");
    store.recover();
    await store.refresh();
    expect(store.getSnapshot().details["1"]).toEqual({ status: "loading" });
    expect(onNotify).not.toHaveBeenCalled();
  });
});

describe("slug and ID cache coherence", () => {
  const slugArticle = (id = 1, version = 10, is_official = true) => ({
    ...article(id, version),
    slug: "shared",
    is_official,
  });
  it("deduplicates slug reads and shares their complete body with ID readers", async () => {
    const { store, server, detail, detailBySlug } = harness();
    server.rows = [slugArticle()];
    await Promise.all([
      store.loadDetailBySlug("shared", true),
      store.loadDetailBySlug("shared", true),
    ]);
    expect(detailBySlug).toHaveBeenCalledTimes(1);
    expect(store.getDetailBySlug("shared", true).article).toBe(
      store.getSnapshot().details["1"].article,
    );
    await store.loadDetail("1");
    expect(detail).not.toHaveBeenCalled();
  });
  it("keeps same-slug sources isolated when one is removed by a slug 404", async () => {
    const { store, server } = harness();
    server.rows = [slugArticle(), slugArticle(2, 10, false)];
    await store.loadDetailBySlug("shared", true);
    await store.loadDetailBySlug("shared", false);
    server.rows = [slugArticle(2, 10, false)];
    await store.loadDetailBySlug("shared", true, true);
    expect(store.getDetailBySlug("shared", true)).toEqual({ status: "ready" });
    expect(store.getSnapshot().details["1"]).toEqual({ status: "ready" });
    expect(
      store.getDetailBySlug("shared", false).article?.announcement_id,
    ).toBe(2);
  });
  it("invalidates slug aliases when a list sees a newer version, then revalidates by ID", async () => {
    const { store, server, detail, detailBySlug } = harness();
    server.rows = [slugArticle()];
    await store.loadDetailBySlug("shared", true);
    server.rows = [slugArticle(1, 20)];
    await store.refresh();
    expect(store.getDetailBySlug("shared", true).status).toBe("loading");
    await store.loadDetailBySlug("shared", true);
    expect(detail).toHaveBeenCalledExactlyOnceWith("1");
    expect(detailBySlug).toHaveBeenCalledTimes(1);
    expect(store.getDetailBySlug("shared", true).article?.updated_time).toBe(
      20,
    );
  });
  it("does not overwrite a newer slug body with a slow older ID response", async () => {
    const { store, server, detail } = harness();
    const old = deferred<AnnouncementArticle>();
    detail.mockReturnValueOnce(old.promise);
    const reading = store.loadDetail("1");
    server.rows = [slugArticle(1, 20)];
    await store.loadDetailBySlug("shared", true);
    old.resolve(slugArticle(1, 10));
    await reading;
    expect(store.getSnapshot().details["1"].article?.updated_time).toBe(20);
    expect(store.getDetailBySlug("shared", true).article?.updated_time).toBe(
      20,
    );
  });
  it("does not restore a removed ID from an initially unresolved slug response", async () => {
    const { store, server, detailBySlug } = harness();
    const old = deferred<AnnouncementArticle>();
    detailBySlug.mockReturnValueOnce(old.promise);
    const reading = store.loadDetailBySlug("shared", true);
    server.rows = [];
    store.notify({ announcement_id: 1, updated_time: 20 });
    await store.refresh();
    // The body was read before removal, even if its version exceeds known metadata.
    old.resolve(slugArticle(1, 30));
    await reading;
    expect(store.getDetailBySlug("shared", true)).toEqual({ status: "ready" });
    expect(store.getSnapshot().details["1"]).toEqual({ status: "ready" });
  });
  it("does not replace a new slug body with an older ID request's transient failure", async () => {
    const { store, server, detail } = harness();
    let fail!: (error: unknown) => void;
    detail.mockImplementationOnce(
      () =>
        new Promise((_resolve, reject) => {
          fail = reject;
        }),
    );
    const reading = store.loadDetail("1");
    server.rows = [slugArticle(1, 20)];
    await store.loadDetailBySlug("shared", true);
    fail({ status: 503 });
    await reading;
    expect(store.getDetailBySlug("shared", true).article?.updated_time).toBe(
      20,
    );
    expect(store.getSnapshot().details["1"].status).toBe("ready");
  });
  it("cancels a slow ID body when a known slug confirms its removal", async () => {
    const { store, server, detail } = harness();
    server.rows = [slugArticle()];
    await store.loadDetailBySlug("shared", true);
    const old = deferred<AnnouncementArticle>();
    detail.mockReturnValueOnce(old.promise);
    const reading = store.loadDetail("1", true);
    server.rows = [];
    await store.loadDetailBySlug("shared", true, true);
    old.resolve(slugArticle(1, 30));
    await reading;
    expect(store.getSnapshot().details["1"]).toEqual({ status: "ready" });
    expect(store.getDetailBySlug("shared", true)).toEqual({ status: "ready" });
  });
  it("discards an old slug body after a newer ID verification publishes its alias", async () => {
    const { store, server, detailBySlug } = harness();
    const old = deferred<AnnouncementArticle>();
    detailBySlug.mockReturnValueOnce(old.promise);
    const reading = store.loadDetailBySlug("shared", true);
    server.rows = [slugArticle(1, 20)];
    store.notify({ announcement_id: 1, updated_time: 20 });
    await store.refresh();
    old.resolve(slugArticle(1, 10));
    await reading;
    expect(store.getDetailBySlug("shared", true).article?.updated_time).toBe(
      20,
    );
  });
  it("discards a slow slug refresh invalidated by an ID removal", async () => {
    const { store, server, detailBySlug } = harness();
    server.rows = [slugArticle()];
    await store.loadDetailBySlug("shared", true);
    const old = deferred<AnnouncementArticle>();
    detailBySlug.mockReturnValueOnce(old.promise);
    const reading = store.loadDetailBySlug("shared", true, true);
    server.rows = [];
    store.notify({ announcement_id: 1, updated_time: 20 });
    await store.refresh();
    old.resolve(slugArticle());
    await reading;
    expect(store.getDetailBySlug("shared", true)).toEqual({ status: "ready" });
    expect(store.getSnapshot().details["1"]).toEqual({ status: "ready" });
  });
  it("keeps a stale slug result below a newer list version out of the body cache", async () => {
    const { store, server } = harness();
    server.rows = [slugArticle(1, 20)];
    await store.refresh();
    server.rows = [slugArticle(1, 10)];
    await store.loadDetailBySlug("shared", true);
    expect(store.getDetailBySlug("shared", true)).toEqual({ status: "error" });
    expect(store.getSnapshot().details["1"]).toBeUndefined();
    server.rows = [slugArticle(1, 20)];
    await store.loadDetailBySlug("shared", true, true);
    expect(store.getDetailBySlug("shared", true).article?.updated_time).toBe(
      20,
    );
  });
});

describe("cross-view races", () => {
  it("confirms removal immediately while a mounted page request is still pending", async () => {
    const { store, server, list } = harness();
    await store.refresh();
    await store.loadDetail("1");
    const page = deferred<AnnouncementListResponse>();
    list.mockReturnValueOnce(page.promise);
    const stop = store.watchList({ page: 2, size: 20 });
    server.rows = [];
    store.notify({ announcement_id: 1, updated_time: 20 });
    await vi.waitFor(() =>
      expect(store.getSnapshot().details["1"]).toEqual({ status: "ready" }),
    );
    expect(store.getSnapshot().active.rows).toEqual([]);
    page.resolve(response([row()]));
    await store.refresh();
    expect(
      store.getSnapshot().lists[listQueryKey({ page: 2, size: 20 })].rows,
    ).toEqual([]);
    stop();
  });
  it("opens cards after a late active response instead of losing the verified reminder", async () => {
    const { store, server, active, onNotify } = harness();
    active.mockResolvedValue({
      ...response([article()]),
      last_updated_time: 999,
    });
    await store.refresh();
    server.rows = [article(1, 20)];
    const cards = deferred<ReturnType<typeof response<AnnouncementArticle>>>();
    active.mockReturnValueOnce(cards.promise);
    store.notify({ announcement_id: 1, updated_time: 20 });
    await vi.waitFor(() => expect(onNotify).toHaveBeenCalledTimes(1));
    expect(store.getSnapshot().cardOpen).toBe(false);
    cards.resolve(response([article(1, 20)]));
    await vi.waitFor(() => expect(store.getSnapshot().cardOpen).toBe(true));
    expect(store.getSnapshot().reminderVersion).toBe(1);
  });
  it("retries failed active reads and preserves their pending card reminder independently of unread", async () => {
    vi.useFakeTimers();
    const { store, server, active, onNotify } = harness();
    await store.refresh();
    server.rows = [article(1, 20)];
    active.mockRejectedValueOnce({ status: 503 });
    store.notify({ announcement_id: 1, updated_time: 20 });
    await store.refresh();
    expect(onNotify).toHaveBeenCalledTimes(1);
    expect(store.getSnapshot()).toMatchObject({
      active: { status: "error" },
      cardOpen: false,
    });
    await vi.advanceTimersByTimeAsync(1000);
    expect(store.getSnapshot()).toMatchObject({
      active: { status: "ready" },
      cardOpen: true,
      reminderVersion: 1,
    });
    expect(onNotify).toHaveBeenCalledTimes(1);
  });
  it("does not reopen a dismissed reminder when its delayed active response arrives", async () => {
    const { store, server, active, onNotify } = harness();
    active.mockResolvedValue({
      ...response([article()]),
      last_updated_time: 999,
    });
    await store.refresh();
    server.rows = [article(1, 20)];
    const cards = deferred<ReturnType<typeof response<AnnouncementArticle>>>();
    active.mockReturnValueOnce(cards.promise);
    store.notify({ announcement_id: 1, updated_time: 20 });
    await vi.waitFor(() => expect(onNotify).toHaveBeenCalledTimes(1));
    store.closeTips();
    cards.resolve(response([article(1, 20)]));
    await store.refresh();
    expect(store.getSnapshot().cardOpen).toBe(false);
  });
});
