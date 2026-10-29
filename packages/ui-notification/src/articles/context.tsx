import { createContext, useContext } from "react";
import type { API } from "@orderly.network/types";
import type { AnnouncementSummary } from "../types";
import type {
  LocalizedAnnouncement,
  LocalizedArticle,
  ReadStatus,
} from "./model";
import type { AnnouncementListQuery } from "./types";

/**
 * Localized page value returned by a custom announcement source.
 */
export type AnnouncementListValue = {
  /** Localized rows for this page. */
  articles: LocalizedAnnouncement[];
  /** Server or custom-source total before client filtering. */
  total: number;
  /** Optional server pagination; the list hook fills missing metadata from total/page/size. */
  meta?: API.RecordsMeta;
  /** Current list read state. */
  status: ReadStatus;
};

/**
 * Shared bell, carousel and maintenance presentation state for automatic or custom sources.
 */
export type AnnouncementScaffoldState = {
  /** Bell summaries, including maintenance when composed by useAnnouncement. */
  tips: AnnouncementSummary[];
  /** Independent carousel summaries; custom sources may omit this to reuse tips. */
  cardTips?: AnnouncementSummary[];
  /** Active-card read state, independent of the bell. */
  cardStatus?: ReadStatus;
  /** Optional explicit maintenance cards; otherwise the existing maintenance source is used. */
  maintenanceTips?: AnnouncementSummary[];
  /** Localized active-maintenance dialog message, if any. */
  maintenanceDialogInfo?: string;
  /** Whether the carousel should be visible before hideTips is applied. */
  showAnnouncement: boolean;
  /** Dismiss cards without acknowledging ordinary unread state. */
  closeTips: () => void;
  /** Ordinary announcement unread indicator; independent of carousel visibility. */
  hasUnread?: boolean;
  /** Acknowledge unread and dismiss cards when opening the bell. */
  openMessageCenter?: () => void;
  /** Carousel session identifier; may be used as a React key to reset selection on reopen. */
  cardSession?: number;
  /** Changes for a new visible publication/update reminder. */
  reminderVersion?: number;
  /** Optional custom-source selection callback; undefined ID means no selected card. */
  onCurrentChange?: (id?: string | number) => void;
  /** Bell read state. */
  status?: ReadStatus;
  /** Retry the bell read. */
  retry?: () => void;
};

/**
 * Custom source contract. Required members supply bell data; optional members support cards and paginated/detail reads.
 */
export type AnnouncementArticlesValue = {
  /** Localized bell rows; not the complete server history. */
  articles: LocalizedAnnouncement[];
  /** Bell read state. */
  status: ReadStatus;
  /** Retry the bell/source read. */
  retry: () => void;
  /** Refresh this source and its active consumers. */
  refresh: () => void;
  /** Custom card and unread state. Supplying articles alone does not enable independent card reminders. */
  scaffoldState?: AnnouncementScaffoldState;
  /** Read current ID detail state; ready without article means no visible match. */
  getDetail?: (id: string) => AnnouncementDetailState;
  /** Load by ID; force requests a fresh read. Resolves when the source finishes loading. */
  loadDetail?: (id: string, force?: boolean) => Promise<void>;
  /** Read a page. Without it, useAnnouncementList filters and paginates articles in memory. */
  getList?: (query: AnnouncementListQuery) => AnnouncementListValue;
  /** Subscribe to a page; return a cleanup function. */
  watchList?: (query: AnnouncementListQuery) => () => void;
  /** Retry the selected page instead of the bell/source read. */
  retryList?: (query: AnnouncementListQuery) => void;
  /** Read a slug in the selected source. Supply together with loadDetailBySlug. */
  getDetailBySlug?: (
    slug: string,
    isOfficial: boolean,
  ) => AnnouncementDetailState;
  /** Load a source-scoped slug; force requests a fresh read. Supply together with getDetailBySlug. */
  loadDetailBySlug?: (
    slug: string,
    isOfficial: boolean,
    force?: boolean,
  ) => Promise<void>;
};

/**
 * A detail read result. A ready value without an article means no visible match.
 */
export type AnnouncementDetailState = {
  /** Current detail read state. */
  status: ReadStatus;
  /** Localized complete article; absent for unavailable or hidden content. */
  article?: LocalizedArticle;
};

const emptyArticles: AnnouncementArticlesValue = {
  articles: [],
  status: "ready",
  retry: () => undefined,
  refresh: () => undefined,
};

/**
 * Overrides automatic announcement reads with a custom source. The source owns localization and visibility.
 */
export const AnnouncementArticlesContext =
  createContext<AnnouncementArticlesValue | null>(null);

/**
 * Reads the ancestor announcement source without creating one.
 * @returns Source data and methods, or an empty ready source with no-op retry/refresh when no provider exists.
 */
export function useAnnouncementArticles(): AnnouncementArticlesValue {
  return useContext(AnnouncementArticlesContext) ?? emptyArticles;
}
