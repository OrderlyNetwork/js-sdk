import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import {
  useConfig,
  useLazyQuery,
  useLocalStorage,
  useMarketList,
  useMemoizedFn,
  useOrderlyContext,
  useWS,
} from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { useAppContext } from "@orderly.network/react-app";
import type { API } from "@orderly.network/types";
import { shouldShowListingDelistingAnnouncement } from "../utils";
import { type AnnouncementArticlesValue } from "./context";
import { localizeAnnouncement, localizeArticle, toSummary } from "./model";
import {
  AnnouncementStore,
  announcementQuery,
  announcementActiveQuery,
  announcementLocale,
  announcementTopics,
  emptyListState,
  listQueryKey,
} from "./store";
import type {
  AnnouncementActiveResponse,
  AnnouncementArticle,
  AnnouncementListQuery,
  AnnouncementListResponse,
  AnnouncementListRow,
  ContentLocale,
} from "./types";

const identity = <T>(data: T) => data;
const legacyCategories: Record<string, AnnouncementListRow["category"]> = {
  LISTING: "LISTINGS",
  DELISTING: "DELISTINGS",
  CAMPAIGN: "CAMPAIGN",
  UPDATES: "UPDATES",
  LEGAL: "LEGAL",
};

/** Retain legacy dataAdapter rows without inventing their source identity. */
function normalizeRow(row: AnnouncementListRow): AnnouncementListRow {
  return {
    ...row,
    category: row.category ?? legacyCategories[row.type ?? ""] ?? "OTHERS",
    published_time: row.published_time ?? row.updated_time ?? 0,
    updated_time: row.updated_time ?? 0,
    translations: row.translations ?? { en: { title: row.message ?? "" } },
  };
}

export function useLiveAnnouncements(
  enabled = true,
): AnnouncementArticlesValue {
  const brokerId = useConfig<string | undefined>("brokerId") || undefined;
  const apiBaseUrl = useConfig<string>("apiBaseUrl");
  const { widgetConfigs } = useAppContext();
  const excludeOfficial = widgetConfigs?.announcement?.excludeOfficial ?? false;
  const scope = JSON.stringify([apiBaseUrl, brokerId, excludeOfficial]);
  const { i18n } = useTranslation();
  const locale = announcementLocale(i18n.language);
  const marketList = useMarketList();
  const { dataAdapter } = useOrderlyContext();
  const adapter = dataAdapter?.announcementList;
  const previousAdapter = useRef(adapter);
  const ws = useWS();
  const [unread, setUnread] = useLocalStorage<boolean>(
    `orderly_announcement_unread:${JSON.stringify(brokerId ?? null)}`,
    false,
  );
  const { trigger: fetchList } = useLazyQuery<AnnouncementListResponse>(
    enabled ? `${apiBaseUrl}/v2/public/announcement` : null,
    { formatter: identity },
  );
  const { trigger: fetchActive } = useLazyQuery<AnnouncementActiveResponse>(
    enabled ? `${apiBaseUrl}/v2/public/announcement/active` : null,
    { formatter: identity },
  );
  const { trigger: fetchDetail } = useLazyQuery<AnnouncementArticle>(
    enabled ? `${apiBaseUrl}/v2/public/announcement/detail` : null,
    { formatter: identity },
  );
  const list = useMemoizedFn(
    async (query: AnnouncementListQuery): Promise<AnnouncementListResponse> => {
      const params = Object.fromEntries(
        new URLSearchParams(
          announcementQuery({ brokerId, excludeOfficial, ...query }).split(
            "?",
          )[1],
        ),
      );
      const data = await fetchList(params);
      const rows =
        dataAdapter?.announcementList?.(data.rows ?? []) ?? data.rows ?? [];
      return { ...data, rows: rows.map(normalizeRow) };
    },
  );
  const active = useMemoizedFn(
    async (
      contentLocale: ContentLocale,
    ): Promise<AnnouncementActiveResponse> => {
      const params = Object.fromEntries(
        new URLSearchParams(
          announcementActiveQuery(
            { brokerId, excludeOfficial },
            contentLocale,
          ).split("?")[1],
        ),
      );
      return fetchActive(params);
    },
  );
  const detail = useMemoizedFn(
    (id: string): Promise<AnnouncementArticle> =>
      fetchDetail({
        announcement_id: id,
        ...(brokerId ? { broker_id: brokerId } : {}),
      }),
  );
  const detailBySlug = useMemoizedFn(
    (slug: string, isOfficial: boolean): Promise<AnnouncementArticle> =>
      fetchDetail({
        slug,
        ...(isOfficial ? { is_official: true } : { broker_id: brokerId }),
      }),
  );
  const visible = useMemoizedFn((row: AnnouncementListRow) => {
    if (row.is_official === true && excludeOfficial) return false;
    if (row.is_official === false && !brokerId) return false;
    return shouldShowListingDelistingAnnouncement(
      {
        ...row,
        type:
          row.category === "LISTINGS"
            ? "LISTING"
            : row.category === "DELISTINGS"
              ? "DELISTING"
              : row.type,
        message: row.translations.en.title,
      } as API.AnnouncementRow,
      marketList,
    );
  });
  const onNotify = useCallback(() => setUnread(true), [setUnread]);
  const store = useMemo(
    () =>
      new AnnouncementStore({
        brokerId,
        excludeOfficial,
        locale,
        list,
        active,
        detail,
        detailBySlug,
        visible,
        onNotify,
      }),
    [scope],
  );
  const snapshot = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot,
  );

  useEffect(() => {
    if (!enabled) return;
    const subscriptions = announcementTopics({ brokerId, excludeOfficial }).map(
      (topic) => ws.subscribe(topic, { onMessage: store.notify }),
    );
    const connection = (event: { type: string; isPrivate: boolean }) => {
      if (event.type === "open" && !event.isPrivate) store.recover();
    };
    ws.on("status:change", connection);
    const foreground = () => {
      if (document.visibilityState !== "hidden") store.recover();
    };
    window.addEventListener("online", store.recover);
    window.addEventListener("focus", foreground);
    window.addEventListener("pageshow", foreground);
    document.addEventListener("visibilitychange", foreground);
    store.start();
    const hourly = window.setInterval(store.recover, 60 * 60 * 1000);
    return () => {
      store.stop();
      subscriptions.forEach((unsubscribe) => unsubscribe?.());
      ws.off("status:change", connection);
      window.clearInterval(hourly);
      window.removeEventListener("online", store.recover);
      window.removeEventListener("focus", foreground);
      window.removeEventListener("pageshow", foreground);
      document.removeEventListener("visibilitychange", foreground);
    };
  }, [store, enabled, ws]);
  useEffect(() => {
    if (enabled) store.setLocale(locale);
  }, [enabled, store, locale]);
  useEffect(() => {
    if (previousAdapter.current !== adapter) {
      previousAdapter.current = adapter;
      if (enabled) store.recover();
    }
  }, [adapter, enabled, store]);

  const articles = useMemo(
    () =>
      snapshot.rows
        .filter(visible)
        .map((row) => localizeAnnouncement(row, locale)),
    [snapshot.rows, marketList, brokerId, excludeOfficial, locale],
  );
  const getDetail = useCallback(
    (id: string) => {
      const entry = snapshot.details[id];
      const article = entry?.article;
      return {
        status: entry?.status ?? ("loading" as const),
        article:
          article && visible(article)
            ? localizeArticle(article, locale)
            : undefined,
      };
    },
    [snapshot.details, locale, marketList, brokerId, excludeOfficial],
  );
  const getList = useCallback(
    (query: AnnouncementListQuery) => {
      const entry = snapshot.lists[listQueryKey(query)] ?? emptyListState;
      return {
        ...entry,
        articles: entry.rows
          .filter(visible)
          .map((row) => localizeAnnouncement(row, locale)),
      };
    },
    [snapshot.lists, locale, marketList, brokerId, excludeOfficial],
  );
  const getDetailBySlug = useCallback(
    (slug: string, isOfficial: boolean) => {
      const entry = store.getDetailBySlug(slug, isOfficial);
      return {
        status: entry.status,
        article:
          entry.article && visible(entry.article)
            ? localizeArticle(entry.article, locale)
            : undefined,
      };
    },
    [
      store,
      snapshot.slugDetails,
      snapshot.details,
      locale,
      marketList,
      brokerId,
      excludeOfficial,
    ],
  );
  const tips = useMemo(() => articles.map(toSummary), [articles]);
  const cardTips = useMemo(
    () =>
      snapshot.activeLocale === locale
        ? snapshot.active.rows
            .filter(visible)
            .map((article) => toSummary(localizeArticle(article, locale)))
        : [],
    [
      snapshot.active,
      snapshot.activeLocale,
      locale,
      marketList,
      brokerId,
      excludeOfficial,
    ],
  );
  const openMessageCenter = useCallback(() => {
    setUnread(false);
    store.closeTips();
  }, [store, setUnread]);
  return {
    articles,
    status: snapshot.status,
    refresh: store.refresh,
    retry: store.retryBell,
    getDetail,
    loadDetail: store.loadDetail,
    getList,
    watchList: store.watchList,
    retryList: store.retryList,
    getDetailBySlug,
    loadDetailBySlug: store.loadDetailBySlug,
    scaffoldState: {
      tips,
      cardTips,
      cardStatus:
        snapshot.activeLocale === locale ? snapshot.active.status : "loading",
      hasUnread: !!unread,
      showAnnouncement: snapshot.cardOpen,
      reminderVersion: snapshot.reminderVersion,
      closeTips: store.closeTips,
      openMessageCenter,
      status: snapshot.status,
      retry: store.retryBell,
    },
  };
}
