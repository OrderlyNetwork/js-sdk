import { useCallback, useEffect } from "react";
import { useConfig } from "@orderly.network/hooks";
import { announcementDetailUrl } from "../articles/routes";
import {
  announcementCategories,
  type AnnouncementCategory,
} from "../articles/types";
import { useAnnouncementDetail } from "../articles/useAnnouncementDetail";
import { useAnnouncementList } from "../articles/useAnnouncementList";

export type AnnouncementCenterScriptOptions = {
  /** Backend-generated slug; takes precedence over id when non-empty. */
  slug?: string;
  id?: string;
  isOfficial?: boolean;
  onRouteChange?: (href: string) => void;
};

const readSearchParams = () =>
  new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : "",
  );

const hrefWithSearch = (path: string, params: URLSearchParams) => {
  const search = params.toString();
  return search ? `${path}?${search}` : path;
};

export const useAnnouncementCenterScript = (
  options: AnnouncementCenterScriptOptions = {},
) => {
  const platformName = useConfig<string | undefined>("brokerName");
  const { slug, id, onRouteChange } = options;
  const isDetail = !!(slug || id);

  const searchParams = readSearchParams();
  const source = searchParams.get("is_official");
  const invalidSource =
    !!slug &&
    options.isOfficial === undefined &&
    source !== null &&
    source !== "true" &&
    source !== "false";
  const detail = useAnnouncementDetail(
    invalidSource ? undefined : slug ? { slug } : id ? { id } : undefined,
    options.isOfficial ?? source === "true",
  );
  const category: AnnouncementCategory =
    announcementCategories.find(
      (item) => item === searchParams.get("category"),
    ) ?? "all";
  const requestedPage = Number(searchParams.get("page") ?? 1);
  const page =
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;
  const list = useAnnouncementList({ category, page, size: 20 }, !isDetail);
  const pageTotal = Math.max(1, Math.ceil(list.total / 20));
  const announcements = list.articles;
  const article = invalidSource ? undefined : detail.article;

  const selectCategory = useCallback(
    (nextCategory: AnnouncementCategory) => {
      const params = readSearchParams();
      params.delete("is_official");
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
      params.delete("is_official");
      if (nextPage === 1) params.delete("page");
      else params.set("page", String(nextPage));
      onRouteChange?.(hrefWithSearch("/announcement", params));
    },
    [onRouteChange],
  );
  useEffect(() => {
    if (!isDetail && list.status === "ready" && page > pageTotal)
      selectPage(pageTotal);
  }, [isDetail, list.status, page, pageTotal, selectPage]);
  const openArticle = useCallback(
    (id: number) => {
      onRouteChange?.(
        announcementDetailUrl(
          announcements.find((item) => item.announcement_id === id) ?? {
            announcement_id: id,
          },
          readSearchParams(),
        ),
      );
    },
    [announcements, onRouteChange],
  );
  const backToList = useCallback(
    (nextCategory?: AnnouncementCategory) => {
      const params = readSearchParams();
      params.delete("is_official");
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
    isDetail,
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
    status: invalidSource
      ? ("ready" as const)
      : isDetail
        ? detail.status
        : list.status,
    retry: isDetail ? detail.retry : list.retry,
  };
};

export type AnnouncementCenterScriptReturns = ReturnType<
  typeof useAnnouncementCenterScript
>;
