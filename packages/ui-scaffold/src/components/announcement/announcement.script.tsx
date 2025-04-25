import { useEffect, useRef, useState } from "react";
import { UTCDateMini } from "@date-fns/utc";
import { getTimestamp } from "@orderly.network/utils";
import { format } from "date-fns";
import {
  MaintenanceStatus,
  useLocalStorage,
  useMaintenanceStatus,
  useQuery,
  useWS,
} from "@orderly.network/hooks";
import { API, WSMessage } from "@orderly.network/types";
import { i18n } from "@orderly.network/i18n";
import { useAppContext } from "@orderly.network/react-app";
import { useObserverElement } from "@orderly.network/ui";

const oneDay = 1000 * 60 * 60 * 24;
const maintentanceId = "-1";

export enum AnnouncementType {
  Listing = "listing",
  Maintenance = "maintenance",
  Delisting = "delisting",
}

export type AnnouncementScriptOptions = {
  hideTips?: boolean;
};

type AnnouncementStore = {
  hidden: boolean;
  updateTime?: number | null;
};

export type AnnouncementScriptReturn = ReturnType<typeof useAnnouncementScript>;

export const useAnnouncementScript = (options?: AnnouncementScriptOptions) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const { showAnnouncement, setShowAnnouncement } = useAppContext();

  const { tips, maintenanceDialogInfo } = useAnnouncementData();

  const [announcementStore, setAnnouncementStore] = useLocalStorage(
    "orderly_announcement",
    {} as AnnouncementStore
  );

  const closeTips = () => {
    setAnnouncementStore({
      hidden: true,
      updateTime: null,
    });
  };

  const nextTips = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % tips.length);
    setTimeout(() => setIsAnimating(false), 200);
  };

  const prevTips = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + tips.length) % tips.length);
    setTimeout(() => setIsAnimating(false), 200);
  };

  useEffect(() => {
    if (!showAnnouncement || tips.length <= 1) {
      return;
    }
    // rolling announcement, every 3 seconds
    const interval = setInterval(() => {
      nextTips();
    }, 3000);

    return () => clearInterval(interval);
  }, [tips, showAnnouncement]);

  useEffect(() => {
    const show =
      !!tips.length && !announcementStore.hidden && !options?.hideTips;
    setShowAnnouncement(show);
  }, [tips, announcementStore, options?.hideTips]);

  const multiLineState = useMultiLine();
  return {
    maintenanceDialogInfo,
    tips,
    currentIndex,
    currentTip: tips[currentIndex],
    closeTips,
    nextTips,
    prevTips,
    showAnnouncement,
    isAnimating,
    ...multiLineState,
  };
};

function useAnnouncementData() {
  const ws = useWS();
  const [tips, setTips] = useState<API.Announcement[]>([]);

  const [maintenanceDialogInfo, setMaintenanceDialogInfo] = useState<
    string | undefined
  >(undefined);

  const { startTime, endTime, status, brokerName } = useMaintenanceStatus();

  const { data: announcements } = useQuery<API.Announcement[]>(
    `/v1/public/announcement`,
    {
      revalidateOnFocus: false,
      refreshInterval: 60 * 60 * 1000, // refresh every 1 hour
    }
  );

  useEffect(() => {
    const unsubscribe = ws.subscribe(`announcement`, {
      onMessage: (message: WSMessage.Announcement) => {
        if (message) {
          setTips((prevTips) => [
            ...prevTips.filter(
              (tip) => tip.announcement_id !== message.announcement_id
            ),
            {
              announcement_id: message.announcement_id,
              message: message.message,
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
        prevTips.filter((tip) => tip.announcement_id !== maintentanceId)
      );
      return;
    }
    setTips((prevTips) => {
      const tips = new Set(prevTips.map((tip) => tip.announcement_id));
      const maintentanceTip = prevTips.find(
        (tip) => tip.announcement_id === maintentanceId
      );
      const newTips: API.Announcement[] = [];
      announcements.forEach((announcement) => {
        if (tips.has(announcement.announcement_id)) {
          return;
        }
        newTips.push({
          announcement_id: announcement.announcement_id,
          message: announcement.message,
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
    const startDate = startTime ? getTimeString(startTime) : "-";
    const endDate = endTime ? getTimeString(endTime) : "-";

    if (status === MaintenanceStatus.Maintenance) {
      setMaintenanceDialogInfo(getMaintentDialogContent(brokerName, endDate));
      return;
    }
    setMaintenanceDialogInfo(undefined);

    if (startTime) {
      if (startTime < getTimestamp() + oneDay) {
        setTips((prevTips) => [
          {
            announcement_id: maintentanceId,
            type: AnnouncementType.Maintenance,
            message: getMaintentTipsContent(brokerName, startDate, endDate),
          },
          ...prevTips.filter(
            (tip) => tip.type !== AnnouncementType.Maintenance
          ),
        ]);
      }
    } else {
      // remove maintenance tip
      setTips((prevTips) =>
        prevTips.filter((tip) => tip.announcement_id !== maintentanceId)
      );
    }
  }, [startTime, endTime, status, brokerName]);

  return {
    tips,
    maintenanceDialogInfo,
  };
}

function useMultiLine() {
  const [mutiLine, setMutiLine] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useObserverElement(contentRef.current, (entry) => {
    setMutiLine(entry.contentRect.height > 20);
  });

  return {
    mutiLine,
    contentRef,
  };
}

const getMaintentTipsContent = (
  brokerName: string,
  startDate: string,
  endDate: string
) =>
  i18n.t("maintenance.tips.description", {
    brokerName,
    startDate,
    endDate,
  });

const getMaintentDialogContent = (brokerName: string, endDate: string) =>
  i18n.t("maintenance.dialog.description", {
    brokerName,
    endDate,
  });

function getTimeString(timestamp: number) {
  const date = format(new UTCDateMini(timestamp), "MMM dd");
  const time = format(new UTCDateMini(timestamp), "h:mm aa");
  return `${time} (UTC) on ${date}`;
}
