import { UTCDateMini } from "@date-fns/utc";
import { getTimestamp, windowGuard } from "@orderly.network/utils";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import {
  MaintenanceStatus,
  useMaintenanceStatus,
  useQuery,
  useWS,
} from "@orderly.network/hooks";
import { API, WSMessage } from "@orderly.network/types";
import { i18n } from "@orderly.network/i18n";
import { useAppContext } from "@orderly.network/react-app";
import { useObserverElement } from "@orderly.network/ui";

function getTimeString(timestamp: number) {
  const date = format(new UTCDateMini(timestamp), "MMM dd");
  const time = format(new UTCDateMini(timestamp), "h:mm aa");
  return `${time} (UTC) on ${date}`;
}

const oneDay = 1000 * 60 * 60 * 24;

const getMaintentTipsContent = (
  brokerName: string,
  startDate: string,
  endDate: string
) =>
  i18n.t("scaffold.maintenance.tips.description", {
    brokerName,
    startDate,
    endDate,
  });

const getMaintentDialogContent = (brokerName: string, endDate: string) =>
  i18n.t("scaffold.maintenance.dialog.description", {
    brokerName,
    endDate,
  });

export enum AnnouncementType {
  Listing = "listing",
  Maintenance = "maintenance",
  Delisting = "delisting",
}

export interface AnnouncementData {
  announcementId: string;
  type?: AnnouncementType;
  content: string;
  url?: string;
}

export type AnnouncementScriptOptions = {
  hideTips?: boolean;
};

export type AnnouncementScriptReturn = ReturnType<typeof useAnnouncementScript>;

export const useAnnouncementScript = (options?: AnnouncementScriptOptions) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const { setShowAnnouncement } = useAppContext();
  const { data: announcements } = useQuery<API.Announcement[]>(
    `/v1/public/announcement`,
    {
      revalidateOnFocus: false,
      refreshInterval: 60 * 60 * 1000, // refresh every 1 hour
    }
  );
  const [tips, setTips] = useState<AnnouncementData[]>([]);

  const [maintenanceDialogInfo, setMaintenanceDialogInfo] = useState<
    string | undefined
  >(undefined);

  const [showTips, setShowTips] = useState(() =>
    window.sessionStorage.getItem("announcementTips") === "hidden"
      ? false
      : true
  );
  const ws = useWS();

  const closeTips = useCallback(() => {
    windowGuard(() => {
      window.sessionStorage.setItem("announcementTips", "hidden");
      setShowTips(false);
    });
  }, []);

  const nextTips = () => {
    setCurrentIndex((currentIndex + 1) % tips.length);
  };

  const prevTips = () => {
    setCurrentIndex((currentIndex - 1 + tips.length) % tips.length);
  };

  const { startTime, endTime, status, brokerName } = useMaintenanceStatus();

  const startDate = useMemo(() => {
    if (!startTime) {
      return "-";
    }
    return getTimeString(startTime);
  }, [startTime]);

  const endDate = useMemo(() => {
    if (!endTime) {
      return "-";
    }
    return getTimeString(endTime);
  }, [endTime]);

  useEffect(() => {
    const unsubscribe = ws.subscribe(`announcement`, {
      onMessage: (message: WSMessage.Announcement) => {
        if (message) {
          setTips((prevTips) => [
            ...prevTips.filter(
              (tip) => tip.announcementId !== message.announcement_id
            ),
            {
              announcementId: message.announcement_id,
              content: message.message,
              url: message.url,
            },
          ]);
        }
      },
    });

    return () => {
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    if (!announcements) {
      return;
    }
    if (!announcements.length) {
      setTips((prevTips) =>
        prevTips.filter((tip) => tip.announcementId !== "-1")
      );
      return;
    }
    setTips((prevTips) => {
      const tips = new Set(prevTips.map((tip) => tip.announcementId));
      const maintentanceTip = prevTips.find(
        (tip) => tip.announcementId === "-1"
      );
      const newTips: AnnouncementData[] = [];
      announcements.forEach((announcement) => {
        if (tips.has(announcement.announcement_id)) {
          return;
        }
        newTips.push({
          announcementId: announcement.announcement_id,
          content: announcement.message,
          url: announcement.url,
        });
      });
      if (maintentanceTip) {
        newTips.unshift(maintentanceTip);
      }
      return newTips;
    });
  }, [announcements]);

  useEffect(() => {
    console.log("-- start time", {
      startTime,
      status,
    });
    if (status === MaintenanceStatus.Maintenance) {
      setMaintenanceDialogInfo(getMaintentDialogContent(brokerName, endDate));
      return;
    }
    setMaintenanceDialogInfo(undefined);

    if (startTime) {
      if (startTime < getTimestamp() + oneDay) {
        setTips((prevTips) => [
          {
            announcementId: "-1",
            type: AnnouncementType.Maintenance,
            content: getMaintentTipsContent(brokerName, startDate, endDate),
          },
          ...prevTips.filter(
            (tip) => tip.type !== AnnouncementType.Maintenance
          ),
        ]);
      }
    } else {
      // remove maintenance tip
      setTips((prevTips) =>
        prevTips.filter((tip) => tip.announcementId !== "-1")
      );
    }
  }, [startTime, status, endDate, brokerName]);

  const showAnnouncement = useMemo(() => {
    return !!tips.length && showTips && !options?.hideTips;
  }, [tips, showTips, options?.hideTips]);

  useEffect(() => {
    setShowAnnouncement(showAnnouncement);
  }, [showAnnouncement]);

  const [mutiLine, setMutiLine] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useObserverElement(contentRef.current, (entry) => {
    setMutiLine(entry.contentRect.height > 20);
  });

  return {
    maintenanceDialogInfo,
    tips,
    currentIndex,
    showTips,
    closeTips,
    nextTips,
    prevTips,
    showAnnouncement,
    contentRef,
    mutiLine,
  };
};
