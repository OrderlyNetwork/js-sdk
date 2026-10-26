import { createContext, useContext } from "react";
import type { AnnouncementSummary } from "../types";
import type {
  LocalizedAnnouncement,
  LocalizedArticle,
  ReadStatus,
} from "./model";
import type { AnnouncementListQuery } from "./types";

export type AnnouncementListValue = {
  articles: LocalizedAnnouncement[];
  total: number;
  status: ReadStatus;
};

/** Scaffold-compatible card state; kept local to avoid a ui-scaffold dependency. */
export type AnnouncementScaffoldState = {
  tips: AnnouncementSummary[];
  cardTips?: AnnouncementSummary[];
  /** Active-card reads have a lifecycle independent of the bell. */
  cardStatus?: ReadStatus;
  maintenanceTips?: AnnouncementSummary[];
  maintenanceDialogInfo?: string;
  showAnnouncement: boolean;
  closeTips: () => void;
  hasUnread?: boolean;
  openMessageCenter?: () => void;
  cardSession?: number;
  /** Advances only for a new visible publication/update push. */
  reminderVersion?: number;
  onCurrentChange?: (id?: string | number) => void;
  status?: ReadStatus;
  retry?: () => void;
};

export type AnnouncementArticlesValue = {
  articles: LocalizedAnnouncement[];
  status: ReadStatus;
  retry: () => void;
  refresh: () => void;
  scaffoldState?: AnnouncementScaffoldState;
  getDetail?: (id: string) => AnnouncementDetailState;
  loadDetail?: (id: string, force?: boolean) => Promise<void>;
  getList?: (query: AnnouncementListQuery) => AnnouncementListValue;
  watchList?: (query: AnnouncementListQuery) => () => void;
  retryList?: (query: AnnouncementListQuery) => void;
};

export type AnnouncementDetailState = {
  status: ReadStatus;
  article?: LocalizedArticle;
};

const emptyArticles: AnnouncementArticlesValue = {
  articles: [],
  status: "ready",
  retry: () => undefined,
  refresh: () => undefined,
};

export const AnnouncementArticlesContext =
  createContext<AnnouncementArticlesValue | null>(null);

export function useAnnouncementArticles(): AnnouncementArticlesValue {
  return useContext(AnnouncementArticlesContext) ?? emptyArticles;
}
