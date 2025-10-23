import { FC, useMemo } from "react";
import { UTCDate } from "@date-fns/utc";
import { format, differenceInHours } from "date-fns";
import { Flex, Text } from "@orderly.network/ui";
import { ArrowRightShortIcon } from "../msgCenter/icons";

export const CampaignContentCard: FC<{
  message: string;
  coverImage: string;
  updateTime: number;
  url?: string | null;
  onItemClick: (url: string) => void;
}> = ({ message, coverImage, url, onItemClick }) => {
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
              Join Now
            </Text>
            <ArrowRightShortIcon size={18} color="success" />
          </button>
        )}
    </div>
  );
};

export const MaintenanceContentCard: FC<{
  message: string;
  startTime: number;
  endTime: number;
}> = ({ message, startTime, endTime }) => {
  const formattedMessage = useMemo(() => {
    // Calculate duration in hours
    const hours = differenceInHours(endTime, startTime);

    // Convert timestamps to UTC dates
    const startUtc = new UTCDate(startTime);
    const endUtc = new UTCDate(endTime);

    // Format start time as HH:mm (24-hour format) in UTC
    const startTimeFormatted = format(startUtc, "HH:mm");

    // Format end time as hh:mm a (12-hour format with AM/PM) in UTC
    const endTimeFormatted = format(endUtc, "hh:mm a");

    return `${hours} HRs at ${startTimeFormatted} - ${endTimeFormatted} (UTC)`;
  }, [startTime, endTime]);

  return (
    <div className="oui-flex oui-flex-col oui-gap-1">
      <Text size="xs" intensity={54}>
        Recently updated
      </Text>
      <Flex itemAlign={"center"}>
        <Text size="xs" weight="bold">
          {formattedMessage}
        </Text>
      </Flex>
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
