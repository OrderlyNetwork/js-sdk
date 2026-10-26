import { createContext, useContext } from "react";
import { RouterAdapter } from "@orderly.network/types";
import {
  useAnnouncement,
  type AnnouncementSummary,
} from "@orderly.network/ui-notification";

export type ScaffoldAnnouncementState = Omit<
  ReturnType<typeof useAnnouncement>,
  "tips" | "maintenanceDialogInfo"
> & {
  maintenanceDialogInfo?: string;
  tips: AnnouncementSummary[];
  cardTips?: AnnouncementSummary[];
  hasUnread?: boolean;
  openMessageCenter?: () => void;
  cardSession?: number;
  onCurrentChange?: (id?: string | number) => void;
  status?: "loading" | "ready" | "error";
  retry?: () => void;
  maintenanceTips?: AnnouncementSummary[];
};

export type ScaffoldState = {
  routerAdapter?: RouterAdapter;
  expanded?: boolean;
  setExpand: (expand: boolean) => void;
  checkChainSupport: (chainId: number | string) => boolean;
  topNavbarHeight: number;
  footerHeight: number;
  announcementHeight: number;
  announcementState: ScaffoldAnnouncementState;
};

export const ScaffoldContext = createContext<ScaffoldState>(
  {} as ScaffoldState,
);

export const useScaffoldContext = () => {
  return useContext(ScaffoldContext);
};
