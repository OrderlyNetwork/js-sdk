import { useTranslation } from "@orderly.network/i18n";
import { Box, Flex } from "@orderly.network/ui";

export const Countdown = ({
  timeInterval,
}: {
  timeInterval: number | undefined;
}) => {
  const { t } = useTranslation();

  if (!timeInterval) {
    return null;
  }

//   const days = Math.floor(timeInterval / (60 * 60 * 24));
//   const daysStr = days.toString().padStart(2, "0");
  
//   const hours = Math.floor((timeInterval % (60 * 60 * 24)) / (60 * 60));
//   const hoursStr = hours.toString().padStart(2, "0");
  
  const minutes = Math.floor(timeInterval / 60);
  const minutesStr = minutes.toString().padStart(2, "0");
  
  const seconds = Math.floor(timeInterval % 60);
  const secondsStr = seconds.toString().padStart(2, "0");


  return (
    <Flex className="oui-text-base-contrast-54 oui-text-xs oui-font-normal">
      <Box
        ml={2}
        className="oui-bg-base-7 oui-px-1 oui-rounded-md oui-text-base-contrast oui-min-w-[22px] oui-text-center oui-text-xs"
      >
        {minutesStr}
      </Box>
      {t("common.minuteShort")}
      {" : "}
      <Box
        ml={1}
        className="oui-bg-base-7 oui-px-1 oui-rounded-md oui-text-base-contrast oui-min-w-[22px] oui-text-center oui-text-xs"
      >
        {secondsStr}
      </Box>
      {t("common.secondShort")}
    </Flex>
  );
};
