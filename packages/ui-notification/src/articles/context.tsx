import { createContext, useContext } from "react";
import type { AnnouncementSummary } from "../types";
import type { LocalizedArticle, ReadStatus } from "./model";

/** Scaffold-compatible card state; kept local to avoid a ui-scaffold dependency. */
export type AnnouncementScaffoldState = {
  tips: AnnouncementSummary[];
  maintenanceTips?: AnnouncementSummary[];
  showAnnouncement: boolean;
  closeTips: () => void;
  hasUnread?: boolean;
  openMessageCenter?: () => void;
  cardSession?: number;
  onCurrentChange?: (id?: string | number) => void;
  status?: ReadStatus;
  retry?: () => void;
};

export type AnnouncementArticlesValue = {
  articles: LocalizedArticle[];
  status: ReadStatus;
  retry: () => void;
  refresh: () => void;
  scaffoldState?: AnnouncementScaffoldState;
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
