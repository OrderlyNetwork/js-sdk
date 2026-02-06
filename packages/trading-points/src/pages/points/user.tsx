import { FC, useCallback } from "react";
import { useTranslation } from "@orderly.network/i18n";
import {
  Box,
  Flex,
  Text,
  cn,
  useScreen,
  Divider,
  Button,
  Tooltip,
  toast,
} from "@orderly.network/ui";
// import { AuthGuard } from "@orderly.network/ui-connector";
import { usePoints } from "../../hooks/usePointsData";
import { RouteOption } from "./page";

type UserProps = {
  onRouteChange: (option: RouteOption) => void;
};

export const User: FC<UserProps> = ({ onRouteChange }) => {
  const { t } = useTranslation();
  const { isMobile } = useScreen();
  const {
    refLink,
    selectedTimeRange,
    setSelectedTimeRange,
    pointsDisplay,
    userStatistics,
    isCurrentStageCompleted,
  } = usePoints();

  const timeRangeOptions = [
    { value: "this_week" as const, label: t("tradingPoints.thisWeek") },
    { value: "last_week" as const, label: t("tradingPoints.lastWeek") },
    { value: "all_time" as const, label: t("tradingPoints.all") },
  ];

  if (isCurrentStageCompleted) {
    if (selectedTimeRange !== "all_time") {
      setSelectedTimeRange("all_time");
    }
    timeRangeOptions.splice(0, 2);
  }

  const timeRangeButtonClass = cn(
    "oui-inline-flex oui-items-center oui-justify-center oui-whitespace-nowrap",
    "oui-box-content oui-rounded oui-px-3 oui-h-7",
    "oui-font-medium oui-text-2xs oui-text-base-contrast-36",
    "hover:oui-text-base-contrast-54 hover:oui-bg-base-5",
    "oui-bg-base-7",
    "data-[state=active]:oui-bg-base-5 data-[state=active]:oui-text-base-contrast",
    "oui-transition-all focus-visible:oui-outline-none",
    "focus-visible:oui-ring-2 focus-visible:oui-ring-ring focus-visible:oui-ring-offset-2",
    "disabled:oui-pointer-events-none disabled:oui-opacity-50",
  );

  const currentPointsDisplay = pointsDisplay.currentPointsDisplay;
  const rankingDisplay = pointsDisplay.rankingDisplay;
  const tradingPointsDisplay = pointsDisplay.tradingPointsDisplay;
  const pnlPointsDisplay = pointsDisplay.pnlPointsDisplay;
  const referralPointsDisplay = pointsDisplay.referralPointsDisplay;

  const formatReferralBoost = (value: number | null | undefined) => {
    return value !== null && value !== undefined ? value : "--";
  };

  const goToPerp = useCallback(() => {
    onRouteChange({
      href: "/perp",
      name: "Perp",
    });
  }, [onRouteChange]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(refLink);
      toast.success(t("common.copy.copied"));
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  const userStats = (
    <>
      <Flex
        direction={isMobile ? "column" : "row"}
        gap={4}
        itemAlign="stretch"
        className="oui-w-full"
      >
        <Flex
          direction="column"
          gap={2}
          className={isMobile ? "oui-w-full" : "oui-w-[200px]"}
        >
          <Flex direction="column" gap={3} p={4} r="2xl">
            <Text className="oui-text-base-contrast-54 oui-text-sm oui-tracking-[0.03em] oui-decoration-dotted oui-text-center oui-w-full">
              {t("tradingPoints.currentPoints")}
            </Text>
            <Text className="oui-text-transparent oui-bg-clip-text oui-gradient-brand oui-text-3xl oui-tracking-[0.03em] oui-text-center oui-w-full oui-h-10 oui-leading-10">
              {currentPointsDisplay}
            </Text>
          </Flex>
          <Divider className="oui-w-full" intensity={8} />
          <Flex direction="column" gap={3} p={4} r="2xl">
            <Text className="oui-text-base-contrast-54 oui-text-sm oui-tracking-[0.03em] oui-text-center oui-w-full">
              {t("tradingPoints.ranking")}
            </Text>
            <Text className="oui-text-transparent oui-bg-clip-text oui-gradient-brand oui-text-3xl oui-tracking-[0.03em] oui-text-center oui-w-full oui-h-10 oui-leading-10">
              {rankingDisplay}
            </Text>
          </Flex>
        </Flex>

        {!isMobile && (
          <Divider
            className="oui-self-stretch"
            intensity={8}
            direction="vertical"
          />
        )}
        {isMobile && <Divider intensity={8} />}

        <Flex
          direction="column"
          className={isMobile ? "oui-w-full" : "oui-flex-1"}
        >
          <Flex
            direction={isMobile ? "column" : "row"}
            gap={6}
            className="oui-w-full oui-h-full"
          >
            <Flex
              direction="column"
              gap={3}
              itemAlign="center"
              justify="center"
              p={4}
              r="xl"
              intensity={800}
              className={cn(
                "oui-backdrop-blur-sm",
                isMobile ? "oui-w-full" : "oui-flex-1 oui-h-full",
              )}
            >
              <Tooltip
                content={t("tradingPoints.tradePointsTooltip")}
                className="oui-max-w-[300px] oui-bg-primary-darken"
              >
                <Text
                  className="oui-text-base-contrast-54 oui-text-sm oui-tracking-[0.03em] oui-text-center oui-w-full
                      "
                  style={{
                    textDecorationLine: "underline",
                    textDecorationStyle: "dotted",
                    textUnderlineOffset: "30%",
                  }}
                >
                  {t("tradingPoints.tradePoints")}
                </Text>
              </Tooltip>

              <Text className="oui-text-base-contrast oui-text-[28px] oui-tracking-[0.03em] oui-text-center oui-w-full oui-leading-9">
                {tradingPointsDisplay}
              </Text>
              <Button size="md" onClick={goToPerp}>
                <Text>{t("tradingPoints.tradeNow")}</Text>
              </Button>
            </Flex>

            <Flex
              direction="column"
              gap={3}
              itemAlign="center"
              justify="center"
              p={4}
              r="xl"
              intensity={800}
              className={cn(
                "oui-backdrop-blur-sm",
                isMobile ? "oui-w-full" : "oui-flex-1 oui-h-full",
              )}
            >
              <Tooltip
                content={t("tradingPoints.pnlPointsTooltip")}
                className="oui-max-w-[300px] oui-bg-primary-darken"
              >
                <Text
                  className="oui-text-base-contrast-54 oui-text-sm oui-tracking-[0.03em] oui-text-center oui-w-full"
                  style={{
                    textDecorationLine: "underline",
                    textDecorationStyle: "dotted",
                    textUnderlineOffset: "30%",
                  }}
                >
                  {t("tradingPoints.pnlPoints")}
                </Text>
              </Tooltip>
              <Text className="oui-text-base-contrast oui-text-[28px] oui-tracking-[0.03em] oui-text-center oui-w-full oui-leading-9">
                {pnlPointsDisplay}
              </Text>
              <Button size="md" onClick={goToPerp}>
                <Text>{t("tradingPoints.tradeNow")}</Text>
              </Button>
            </Flex>

            <Flex
              direction="column"
              gap={3}
              itemAlign="center"
              justify="center"
              p={4}
              r="xl"
              intensity={800}
              className={cn(
                "oui-backdrop-blur-sm",
                isMobile ? "oui-w-full" : "oui-flex-1 oui-h-full",
              )}
            >
              <Tooltip
                content={t("tradingPoints.referralPointsTooltip", {
                  l1: formatReferralBoost(userStatistics?.l1_referral_boost),
                  l2: formatReferralBoost(userStatistics?.l2_referral_boost),
                })}
                className="oui-max-w-[300px] oui-bg-primary-darken"
              >
                <Text
                  className="oui-text-base-contrast-54 oui-text-sm oui-tracking-[0.03em] oui-text-center oui-w-full"
                  style={{
                    textDecorationLine: "underline",
                    textDecorationStyle: "dotted",
                    textUnderlineOffset: "30%",
                  }}
                >
                  {t("tradingPoints.referralPoints")}
                </Text>
              </Tooltip>
              <Text className="oui-text-base-contrast oui-text-[28px] oui-tracking-[0.03em] oui-text-center oui-w-full oui-leading-9">
                {referralPointsDisplay}
              </Text>
              <Button variant="outlined" size="md" onClick={onCopy}>
                <Text className="oui-text-base-contrast-54">
                  {t("tradingPoints.copyLink")}
                </Text>
              </Button>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </>
  );

  return (
    <Flex direction="column" gap={6} className="oui-w-full">
      <Flex
        direction={isMobile ? "column" : "row"}
        gap={isMobile ? 4 : 0}
        itemAlign={isMobile ? "start" : "center"}
        justify="between"
        className="oui-w-full"
      >
        <Text
          className={cn(
            "oui-text-base-contrast",
            isMobile ? "oui-text-2xl" : "oui-text-3xl",
            "oui-tracking-[0.03em]",
          )}
        >
          {t("tradingPoints.myPoints")}
        </Text>
        <Flex gap={2} itemAlign="center">
          {timeRangeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedTimeRange(option.value)}
              data-state={
                selectedTimeRange === option.value ? "active" : "inactive"
              }
              className={timeRangeButtonClass}
            >
              {option.label}
            </button>
          ))}
        </Flex>
      </Flex>
      <Box p={6} r="2xl" className="oui-border oui-border-line oui-w-full">
        {/* <AuthGuard buttonProps={{ size: "lg", fullWidth: true }}>
          {userStats}
        </AuthGuard> */}
        {userStats}
      </Box>
    </Flex>
  );
};
