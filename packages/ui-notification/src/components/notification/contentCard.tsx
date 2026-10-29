import { FC } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Text } from "@orderly.network/ui";
import { formatMaintenanceTime } from "../../utils/maintenanceTime";
import { ArrowRightShortIcon } from "../announcementCenter/icons";

export const CampaignContentCard: FC<{
  message: string;
  coverImage: string;
  updateTime: number;
  url?: string | null;
  onItemClick: (url: string) => void;
}> = ({ message, coverImage, url, onItemClick }) => {
  const { t } = useTranslation();
  return (
    <div className="oui-flex oui-flex-col oui-gap-5">
      <Text size="sm" weight="bold">
        {message}
      </Text>
      <div
        className="oui-rounded-xl oui-bg-base-9 oui-bg-cover oui-bg-center oui-bg-no-repeat"
        style={{
          backgroundImage: `url(${coverImage})`,
          height: "100px",
        }}
      ></div>
      {typeof url === "string" &&
        url !== "" &&
        typeof onItemClick === "function" && (
          <button
            className="oui-flex oui-items-center oui-gap-1"
            onClick={() => onItemClick(url)}
          >
            <Text
              size="xs"
              color="buy"
              className="oui-bg-clip-text oui-text-transparent oui-gradient-brand"
            >
              {t("notification.joinNow")}
            </Text>
            <ArrowRightShortIcon size={18} color="success" />
          </button>
        )}
    </div>
  );
};

export const MaintenanceContentCard: FC<{
  message: string;
  startTime?: number;
  endTime?: number;
}> = ({ message, startTime, endTime }) => {
  const maintenanceTime = formatMaintenanceTime(startTime, endTime);

  return (
    <div className="oui-flex oui-flex-col oui-gap-1">
      {maintenanceTime && (
        <Text
          size="xs"
          intensity={54}
          className="oui-whitespace-normal oui-break-words"
        >
          <span dir="ltr">{maintenanceTime}</span>
        </Text>
      )}
      {message && (
        <Text size="2xs" intensity={80} as="div" className="oui-mt-2">
          {message}
        </Text>
      )}
    </div>
  );
};

export const DelistingContentCard: FC<{
  message: string;
  updateTime: number;
}> = ({ message, updateTime }) => {
  return (
    <div className="oui-flex oui-flex-col oui-gap-1">
      <Text.formatted
        rule="date"
        intensity={54}
        formatString="yyyy-MM-dd HH:mm:ss"
        size="xs"
      >
        {updateTime}
      </Text.formatted>
      <Text size="sm" weight="bold">
        {message}
      </Text>
    </div>
  );
};

export const ListingContentCard: FC<{
  message: string;
  updateTime: number;
}> = ({ message, updateTime }) => {
  return (
    <div className="oui-flex oui-flex-col oui-gap-1">
      <Text.formatted
        rule="date"
        intensity={54}
        formatString="yyyy-MM-dd HH:mm:ss"
        size="xs"
      >
        {updateTime}
      </Text.formatted>
      <Text size="sm" weight="bold">
        {message}
      </Text>
    </div>
  );
};

export const CommunityVoteContentCard: FC<{
  message: string;
  url?: string | null;
  onItemClick: (url: string) => void;
}> = ({ message, url, onItemClick }) => {
  const { t } = useTranslation();
  return (
    <div className="oui-flex oui-flex-col oui-gap-2">
      <Text size="sm" weight="bold">
        {message}
      </Text>
      {typeof url === "string" &&
        url !== "" &&
        typeof onItemClick === "function" && (
          <button
            className="oui-flex oui-items-center oui-gap-1"
            onClick={() => onItemClick(url)}
          >
            <Text
              size="xs"
              color="buy"
              className="oui-bg-clip-text oui-text-transparent oui-gradient-brand"
            >
              {t("notification.joinNow")}
            </Text>
            <ArrowRightShortIcon size={18} color="success" />
          </button>
        )}
    </div>
  );
};
