import { FC } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Text, cn } from "@orderly.network/ui";
import { formatMaintenanceTime } from "../../utils/maintenanceTime";
import { ArrowRightShortIcon } from "../announcementCenter/icons";

export const CampaignContentCard: FC<{
  className?: string;
  message: string;
  coverImage: string;
  updateTime: number;
  url?: string | null;
  onItemClick: (url: string) => void;
}> = ({ className, message, coverImage, url, onItemClick }) => {
  const { t } = useTranslation();
  return (
    <div
      className={cn(
        "oui-notification-campaignCard oui-flex oui-flex-col oui-gap-5",
        className,
      )}
    >
      <Text
        className="oui-notification-contentCard-message"
        size="sm"
        weight="bold"
      >
        {message}
      </Text>
      <div
        className="oui-notification-campaignCard-cover oui-rounded-xl oui-bg-base-9 oui-bg-cover oui-bg-center oui-bg-no-repeat"
        style={{
          backgroundImage: `url(${coverImage})`,
          height: "100px",
        }}
      ></div>
      {typeof url === "string" &&
        url !== "" &&
        typeof onItemClick === "function" && (
          <button
            className="oui-notification-contentCard-join-btn oui-flex oui-items-center oui-gap-1"
            onClick={() => onItemClick(url)}
          >
            <Text
              size="xs"
              color="buy"
              className="oui-bg-clip-text oui-text-transparent oui-gradient-brand"
            >
              {t("notification.joinNow")}
            </Text>
            <ArrowRightShortIcon
              className="oui-notification-contentCard-join-icon"
              size={18}
              color="success"
            />
          </button>
        )}
    </div>
  );
};

export const MaintenanceContentCard: FC<{
  className?: string;
  message: string;
  startTime?: number;
  endTime?: number;
}> = ({ className, message, startTime, endTime }) => {
  const maintenanceTime = formatMaintenanceTime(startTime, endTime);

  return (
    <div
      className={cn(
        "oui-notification-maintenanceCard oui-flex oui-flex-col oui-gap-1",
        className,
      )}
    >
      {maintenanceTime && (
        <Text
          size="xs"
          intensity={54}
          className="oui-notification-contentCard-time oui-whitespace-normal oui-break-words"
        >
          <span dir="ltr">{maintenanceTime}</span>
        </Text>
      )}
      {message && (
        <Text
          size="2xs"
          intensity={80}
          as="div"
          className="oui-notification-contentCard-message oui-mt-2"
        >
          {message}
        </Text>
      )}
    </div>
  );
};

export const DelistingContentCard: FC<{
  className?: string;
  message: string;
  updateTime: number;
}> = ({ className, message, updateTime }) => {
  return (
    <div
      className={cn(
        "oui-notification-delistingCard oui-flex oui-flex-col oui-gap-1",
        className,
      )}
    >
      <Text.formatted
        className="oui-notification-contentCard-time"
        rule="date"
        intensity={54}
        formatString="yyyy-MM-dd HH:mm:ss"
        size="xs"
      >
        {updateTime}
      </Text.formatted>
      <Text
        className="oui-notification-contentCard-message"
        size="sm"
        weight="bold"
      >
        {message}
      </Text>
    </div>
  );
};

export const ListingContentCard: FC<{
  className?: string;
  message: string;
  updateTime: number;
}> = ({ className, message, updateTime }) => {
  return (
    <div
      className={cn(
        "oui-notification-listingCard oui-flex oui-flex-col oui-gap-1",
        className,
      )}
    >
      <Text.formatted
        className="oui-notification-contentCard-time"
        rule="date"
        intensity={54}
        formatString="yyyy-MM-dd HH:mm:ss"
        size="xs"
      >
        {updateTime}
      </Text.formatted>
      <Text
        className="oui-notification-contentCard-message"
        size="sm"
        weight="bold"
      >
        {message}
      </Text>
    </div>
  );
};

export const CommunityVoteContentCard: FC<{
  className?: string;
  message: string;
  url?: string | null;
  onItemClick: (url: string) => void;
}> = ({ className, message, url, onItemClick }) => {
  const { t } = useTranslation();
  return (
    <div
      className={cn(
        "oui-notification-communityVoteCard oui-flex oui-flex-col oui-gap-2",
        className,
      )}
    >
      <Text
        className="oui-notification-contentCard-message"
        size="sm"
        weight="bold"
      >
        {message}
      </Text>
      {typeof url === "string" &&
        url !== "" &&
        typeof onItemClick === "function" && (
          <button
            className="oui-notification-contentCard-join-btn oui-flex oui-items-center oui-gap-1"
            onClick={() => onItemClick(url)}
          >
            <Text
              size="xs"
              color="buy"
              className="oui-bg-clip-text oui-text-transparent oui-gradient-brand"
            >
              {t("notification.joinNow")}
            </Text>
            <ArrowRightShortIcon
              className="oui-notification-contentCard-join-icon"
              size={18}
              color="success"
            />
          </button>
        )}
    </div>
  );
};
