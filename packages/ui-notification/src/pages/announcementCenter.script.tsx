import { useCallback, useEffect } from "react";
import { useConfig } from "@orderly.network/hooks";
import { useAppContext } from "@orderly.network/react-app";
import { usePagination } from "@orderly.network/ui";
import { announcementDetailUrl } from "../articles/routes";
import {
  announcementCategories,
  type AnnouncementCategory,
  type AnnouncementSourceFilter,
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
  const { widgetConfigs } = useAppContext();
  const showSourceBadge = !(
    widgetConfigs?.announcement?.excludeOfficial ?? false
  );
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
  const sourceFilter: AnnouncementSourceFilter = !showSourceBadge
    ? "all"
    : searchParams.get("source") === "official"
      ? "official"
      : searchParams.get("source") === "community"
        ? "community"
        : "all";
  const list = useAnnouncementList(
    { category, page, source: sourceFilter },
    !isDetail,
  );
  const { parsePagination } = usePagination();
  const pagination = parsePagination(list.meta);
  const pageTotal = Math.max(1, pagination.pageTotal ?? 0);
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
  const selectSource = useCallback(
    (nextSource: AnnouncementSourceFilter) => {
      const params = readSearchParams();
      params.delete("is_official");
      if (nextSource === "all") params.delete("source");
      else params.set("source", nextSource);
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
    showSourceBadge,
    showSourceFilter: showSourceBadge,
    isDetail,
    category,
    announcements,
    article,
    selectCategory,
    sourceFilter,
    selectSource,
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

export type AnnouncementCenterScriptReturns = Omit<
  ReturnType<typeof useAnnouncementCenterScript>,
  "showSourceBadge" | "showSourceFilter"
> & {
  showSourceBadge?: boolean;
  showSourceFilter?: boolean;
};
