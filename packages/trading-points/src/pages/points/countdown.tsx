import { FC, useState, useEffect } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Box, Flex, Text, useScreen } from "@orderly.network/ui";
import { usePoints } from "../../hooks/usePointsData";

interface CountdownTimerProps {
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const Countdown: FC<CountdownTimerProps> = ({ className }) => {
  const { isMobile } = useScreen();
  const { currentStage } = usePoints();
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (currentStage?.status !== "pending" || !currentStage?.start_time) {
      return;
    }

    const calculateTimeLeft = (): TimeLeft => {
      const targetDate = currentStage.start_time * 1000; // Convert to milliseconds
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }

      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [currentStage]);

  const formatNumber = (num: number): string => {
    return num.toString().padStart(2, "0");
  };

  if (currentStage?.status !== "pending" || !currentStage?.start_time) {
    return null;
  }

  const targetDate = currentStage.start_time * 1000;
  const now = new Date().getTime();

  if (targetDate <= now) {
    return null;
  }

  return (
    <Flex
      gap={4}
      itemAlign="center"
      justify="center"
      px={9}
      className={className}
    >
      {!isMobile && (
        <Box
          className="oui-w-[200px] oui-h-[1px]"
          style={{
            background: `linear-gradient(123deg, rgba(176, 132, 233, 0.00) 0%, #DEC4FF 123.91%)`,
          }}
        />
      )}
      <Box className="oui-rounded-2xl" p={5}>
        <Flex direction="column" gap={2} itemAlign="center">
          <Text className="oui-text-white/[.36] oui-text-lg">
            {t("tradingPoints.startsIn")}
          </Text>
          <Flex gap={2} itemAlign="center" justify="center">
            <Flex direction="column" gap={1} itemAlign="center">
              <Text className="oui-text-white/98 oui-text-4xl oui-font-bold oui-w-16 oui-text-center">
                {formatNumber(timeLeft.days)}
              </Text>
              <Text className="oui-text-base-contrast-80 oui-text-xs oui-w-16 oui-text-center">
                {t("tradingPoints.days")}
              </Text>
            </Flex>
            <Box className="oui-w-1 oui-h-1 oui-rounded-full oui-bg-base-4" />
            <Flex direction="column" gap={1} itemAlign="center">
              <Text className="oui-text-white/98 oui-text-4xl oui-font-bold oui-w-16 oui-text-center">
                {formatNumber(timeLeft.hours)}
              </Text>
              <Text className="oui-text-base-contrast-80 oui-text-xs oui-w-16 oui-text-center">
                {t("tradingPoints.hours")}
              </Text>
            </Flex>
            <Box className="oui-w-1 oui-h-1 oui-rounded-full oui-bg-base-4" />
            <Flex direction="column" gap={1} itemAlign="center">
              <Text className="oui-text-white/98 oui-text-4xl oui-font-bold oui-w-16 oui-text-center">
                {formatNumber(timeLeft.minutes)}
              </Text>
              <Text className="oui-text-base-contrast-80 oui-text-xs oui-w-16 oui-text-center">
                {t("tradingPoints.minutes")}
              </Text>
            </Flex>
            <Box className="oui-w-1 oui-h-1 oui-rounded-full oui-bg-base-4" />
            <Flex direction="column" gap={1} itemAlign="center">
              <Text className="oui-text-white/98 oui-text-4xl oui-font-bold oui-w-16 oui-text-center">
                {formatNumber(timeLeft.seconds)}
              </Text>
              <Text className="oui-text-base-contrast-80 oui-text-xs oui-w-16 oui-text-center">
                {t("tradingPoints.seconds")}
              </Text>
            </Flex>
          </Flex>
        </Flex>
      </Box>
      {!isMobile && (
        <Box
          className="oui-w-[200px] oui-h-[1px]"
          style={{
            background: `linear-gradient(270deg, rgba(176, 132, 233, 0.00) 0%, #DEC4FF 123.91%)`,
          }}
        />
      )}
    </Flex>
  );
};
