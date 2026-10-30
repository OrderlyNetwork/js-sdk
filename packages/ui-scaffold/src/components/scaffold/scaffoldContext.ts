import { createContext, useContext } from "react";
import { RouterAdapter } from "@orderly.network/types";
import type { AnnouncementScaffoldState } from "@orderly.network/ui-notification";

export type ScaffoldAnnouncementState = AnnouncementScaffoldState;

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
