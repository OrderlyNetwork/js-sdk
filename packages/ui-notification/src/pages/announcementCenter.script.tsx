import { useCallback, useEffect } from "react";
import { useConfig } from "@orderly.network/hooks";
import {
  announcementCategories,
  type AnnouncementCategory,
} from "../articles/types";
import { useAnnouncementDetail } from "../articles/useAnnouncementDetail";
import { useAnnouncementList } from "../articles/useAnnouncementList";

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
  const { announcementId, onRouteChange } = options;

  const detail = useAnnouncementDetail(announcementId);

  const searchParams = readSearchParams();
  const category: AnnouncementCategory =
    announcementCategories.find(
      (item) => item === searchParams.get("category"),
    ) ?? "all";
  const requestedPage = Number(searchParams.get("page") ?? 1);
  const page =
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;
  const list = useAnnouncementList(
    { category, page, size: 20 },
    !announcementId,
  );
  const pageTotal = Math.max(1, Math.ceil(list.total / 20));
  const announcements = list.articles;
  const article = detail.article;

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
  useEffect(() => {
    if (!announcementId && list.status === "ready" && page > pageTotal)
      selectPage(pageTotal);
  }, [announcementId, list.status, page, pageTotal, selectPage]);
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
    count: list.total,
    status: announcementId ? detail.status : list.status,
    retry: announcementId ? detail.retry : list.retry,
  };
};

export type AnnouncementCenterScriptReturns = ReturnType<
  typeof useAnnouncementCenterScript
>;
