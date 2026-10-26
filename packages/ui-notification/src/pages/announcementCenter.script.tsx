import { useCallback, useEffect, useMemo } from "react";
import { useConfig } from "@orderly.network/hooks";
import { useAnnouncementArticles } from "../articles/context";
import {
  announcementCategories,
  type AnnouncementCategory,
} from "../articles/types";

export type AnnouncementCenterScriptOptions = {
  announcementId?: string;
  onRouteChange?: (href: string) => void;
};

const readSearchParams = () =>
  new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : "",
  );

const hrefWithSearch = (path: string, params: URLSearchParams) => {
  const search = params.toString();
  return `${path}?${search}`;
};

export const useAnnouncementCenterScript = (
  options: AnnouncementCenterScriptOptions = {},
) => {
  const platformName = useConfig<string | undefined>("brokerName");
  const { articles, status, retry, refresh } = useAnnouncementArticles();
  const { announcementId, onRouteChange } = options;

  useEffect(() => {
    if (announcementId) refresh();
  }, [announcementId, refresh]);

  const searchParams = readSearchParams();
  const category: AnnouncementCategory =
    announcementCategories.find(
      (item) => item === searchParams.get("category"),
    ) ?? "all";
  const filtered = useMemo(
    () =>
      articles.filter(
        (item) => category === "all" || item.category === category,
      ),
    [articles, category],
  );
  const pageTotal = Math.max(1, Math.ceil(filtered.length / 20));
  const requestedPage = Number(searchParams.get("page") ?? 1);
  const page = Number.isSafeInteger(requestedPage)
    ? Math.max(1, Math.min(requestedPage, pageTotal))
    : 1;
  const announcements = filtered.slice((page - 1) * 20, page * 20);
  const article = articles.find(
    (item) => String(item.announcement_id) === announcementId,
  );

  const selectCategory = useCallback(
    (nextCategory: AnnouncementCategory) => {
      const params = readSearchParams();
      if (nextCategory === "all") params.delete("category");
      else params.set("category", nextCategory);
      params.delete("page");
      onRouteChange?.(hrefWithSearch("/announcement", params));
    },
    [onRouteChange],
  );
  const selectPage = useCallback(
    (nextPage: number) => {
      const params = readSearchParams();
      if (nextPage === 1) params.delete("page");
      else params.set("page", String(nextPage));
      onRouteChange?.(hrefWithSearch("/announcement", params));
    },
    [onRouteChange],
  );
  const openArticle = useCallback(
    (id: number) => {
      onRouteChange?.(
        hrefWithSearch(`/announcement/${id}`, readSearchParams()),
      );
    },
    [onRouteChange],
  );
  const backToList = useCallback(
    (nextCategory?: AnnouncementCategory) => {
      const params = readSearchParams();
      if (nextCategory) {
        if (nextCategory === "all") params.delete("category");
        else params.set("category", nextCategory);
        params.delete("page");
      }
      onRouteChange?.(hrefWithSearch("/announcement", params));
    },
    [onRouteChange],
  );

  return {
    platformName,
    announcementId,
    category,
    announcements,
    article,
    selectCategory,
    openArticle,
    backToList,
    selectPage,
    page,
    pageTotal,
    count: filtered.length,
    status,
    retry,
  };
};

export type AnnouncementCenterScriptReturns = ReturnType<
  typeof useAnnouncementCenterScript
>;
