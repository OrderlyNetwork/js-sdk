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
    /** Platform badge label, or undefined for the translated fallback. */
    platformName,
    /** Whether the connected page displays source badges. */
    showSourceBadge,
    /** Whether the connected page displays source filter controls. */
    showSourceFilter: showSourceBadge,
    /** True for the detail view; false for the paginated list. */
    isDetail,
    /** Selected UI category, including all. */
    category,
    /** Localized rows on the current list page. */
    announcements,
    /** Complete localized detail, or undefined when no visible article exists. */
    article,
    /** Request a category change and reset pagination. */
    selectCategory,
    /** Selected all, official or community source filter. */
    sourceFilter,
    /** Request a source change and reset pagination. */
    selectSource,
    /** Navigate to a list article identified by its numeric announcement ID. */
    openArticle,
    /** Return to the list, optionally selecting a different category. */
    backToList,
    /** Request a page change. */
    selectPage,
    /** Selected one-based page. */
    page,
    /** Total page count, with a minimum of one. */
    pageTotal,
    /** Announcement total before client filtering. */
    count: list.total,
    /** Loading, ready or error for the displayed view. */
    status: invalidSource
      ? ("ready" as const)
      : isDetail
        ? detail.status
        : list.status,
    /** Retry the displayed list or detail read. */
    retry: isDetail ? detail.retry : list.retry,
  };
};

/**
 * Controlled props for AnnouncementPageUI. All fields except the display flags are required,
 * even when their value is undefined. The internal page script is not a package-root export.
 */
export type AnnouncementCenterScriptReturns = Omit<
  ReturnType<typeof useAnnouncementCenterScript>,
  "showSourceBadge" | "showSourceFilter"
> & {
  /**
   * Display source badges.
   * @default true
   */
  showSourceBadge?: boolean;
  /**
   * Display source filter controls.
   * @default true
   */
  showSourceFilter?: boolean;
};
