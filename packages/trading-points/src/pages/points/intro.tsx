import { useState } from "react";
import { useTranslation } from "@orderly.network/i18n";
import {
  Box,
  Flex,
  Text,
  cn,
  useScreen,
  Divider,
  CopyIcon,
  ChevronDownIcon,
  toast,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from "@orderly.network/ui";
import { usePoints } from "../../hooks/usePointsData";

export const Intro = () => {
  const { isMobile } = useScreen();
  const {
    currentStage,
    stages,
    setCurrentStage,
    refLink,
    refCode,
    allTimePointsDisplay,
    isNoCampaign,
  } = usePoints();

  const [isStageDropdownOpen, setIsStageDropdownOpen] = useState(false);

  const { t } = useTranslation();

  const onCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(refCode);
      toast.success(t("common.copy.copied"));
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  };

  const onCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(refLink);
      toast.success(t("common.copy.copied"));
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  const handleLearnMore = () => {
    const faqElement = document.getElementById("points-faq");
    if (faqElement) {
      faqElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const formatStageDate = (startTime: number, endTime: number | null) => {
    const formatDate = (timestamp: number) => {
      const date = new Date(timestamp * 1000);
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const day = String(date.getUTCDate()).padStart(2, "0");
      const year = date.getUTCFullYear();
      return `${month}/${day}/${year}`;
    };

    const startDate = formatDate(startTime);
    const endDate = endTime ? formatDate(endTime) : "Recurring";
    return `${startDate} - ${endDate}`;
  };

  return (
    <Flex direction="column" gap={8} className="oui-w-full">
      {isNoCampaign ? (
        <Flex
          direction="column"
          gap={6}
          itemAlign="start"
          className="oui-w-full"
        >
          <Flex
            direction={isMobile ? "column" : "row"}
            gap={4}
            itemAlign={isMobile ? "start" : "center"}
            justify="between"
            className="oui-w-full"
          >
            <Flex
              direction={isMobile ? "column" : "row"}
              itemAlign={isMobile ? "start" : "center"}
              className={isMobile ? "oui-w-full" : ""}
            >
              <Text
                className={cn(
                  "oui-text-base-contrast",
                  isMobile ? "oui-text-xl" : "oui-text-4xl",
                  "oui-font-600 oui-tracking-[0.03em] oui-leading-tight",
                )}
              >
                No Active Campaigns
              </Text>
            </Flex>
          </Flex>

          {/* Description */}
          <Text
            className={cn(
              "oui-text-[14px]",
              "oui-leading-[20px]",
              "oui-font-semibold",
              "oui-text-base-contrast-54",
            )}
          >
            There are currently no active point events. Please wait for the next
            update.
          </Text>
        </Flex>
      ) : (
        <Flex
          direction="column"
          gap={6}
          itemAlign="start"
          className="oui-w-full"
        >
          <Flex
            direction={isMobile ? "column" : "row"}
            gap={4}
            itemAlign={isMobile ? "start" : "center"}
            justify="between"
            className="oui-w-full"
          >
            <Flex
              direction={isMobile ? "column" : "row"}
              itemAlign={isMobile ? "start" : "center"}
              className={isMobile ? "oui-w-full" : ""}
            >
              <Text
                className={cn(
                  "oui-text-base-contrast",
                  isMobile ? "oui-text-xl" : "oui-text-4xl",
                  "oui-font-600 oui-tracking-[0.03em] oui-leading-tight",
                )}
              >
                Stage {currentStage?.epoch_period} ·
              </Text>
              <Flex gap={3} itemAlign="center">
                <Text
                  className={cn(
                    isMobile ? "oui-text-xl" : "oui-text-4xl",
                    "oui-text-primary",
                    "oui-text-center",
                    "oui-pl-2",
                  )}
                >
                  {currentStage?.stage_name}
                </Text>
                <img
                  src="https://oss.woo.org/static/images/sdk/pt-hot.png"
                  alt="Hot"
                  className={
                    isMobile ? "oui-w-8 oui-h-8" : "oui-w-[48px] oui-h-[48px]"
                  }
                />
              </Flex>
            </Flex>

            <DropdownMenuRoot
              open={isStageDropdownOpen}
              onOpenChange={setIsStageDropdownOpen}
            >
              <DropdownMenuTrigger asChild>
                <Flex
                  gap={2}
                  itemAlign="center"
                  px={3}
                  py={2}
                  className="oui-w-[230px] oui-bg-white/[.06] oui-border oui-border-white/[0.12] oui-rounded-md  hover:oui-cursor-pointer hover:oui-opacity-80 oui-transition-opacity"
                >
                  <Text className="oui-flex-1 oui-text-[11px] oui-tracking-[0.03em] oui-whitespace-nowrap oui-text-white/[.36]">
                    {currentStage
                      ? `Stage ${currentStage.epoch_period}: ${formatStageDate(currentStage.start_time, currentStage.end_time)}`
                      : ""}
                  </Text>
                  <ChevronDownIcon
                    size={12}
                    className={cn(
                      "oui-text-white/[.36]",
                      "oui-transition-transform",
                      isStageDropdownOpen && "oui-rotate-180",
                    )}
                  />
                </Flex>
              </DropdownMenuTrigger>
              <DropdownMenuPortal>
                <DropdownMenuContent
                  onCloseAutoFocus={(e) => e.preventDefault()}
                  onClick={(e) => e.stopPropagation()}
                  sideOffset={4}
                  collisionPadding={{ right: 16 }}
                  className={cn(
                    "oui-bg-base-8 oui-w-[230px] oui-p-1 oui-rounded-lg",
                    "oui-border oui-border-line-6",
                    "oui-font-semibold",
                    "oui-shadow-[0px_3px_6px_0px_rgba(0,0,0,0.2)]",
                  )}
                >
                  <Flex
                    direction="column"
                    itemAlign="start"
                    gap={0}
                    className="oui-w-full"
                  >
                    {stages?.rows?.map((stage) => {
                      const isSelected =
                        currentStage?.stage_id === stage.stage_id;
                      const isDisabled = stage.status !== "active";
                      const isActive = stage.status === "active";
                      return (
                        <Flex
                          key={stage.stage_id}
                          gap={2}
                          itemAlign="center"
                          px={2}
                          py={2}
                          r="sm"
                          onClick={() => {
                            setCurrentStage(stage);
                            setIsStageDropdownOpen(false);
                          }}
                          className={cn(
                            "oui-rounded oui-relative oui-w-full",
                            "hover:oui-cursor-pointer hover:oui-opacity-80",
                            isSelected
                              ? "oui-bg-base-5"
                              : "hover:oui-bg-base-5/50",
                          )}
                        >
                          <Text
                            className={cn(
                              "oui-text-[11px] oui-tracking-[0.03em] oui-whitespace-nowrap",
                              isSelected
                                ? "oui-text-base-contrast-54 oui-font-semibold"
                                : "oui-text-white/[.36]",
                            )}
                          >
                            {`Stage ${stage.epoch_period}: ${formatStageDate(stage.start_time, stage.end_time)}`}
                          </Text>
                          {isActive && (
                            <Box className="oui-w-1 oui-h-1 oui-rounded-full oui-bg-primary oui-flex-shrink-0" />
                          )}
                        </Flex>
                      );
                    })}
                  </Flex>
                </DropdownMenuContent>
              </DropdownMenuPortal>
            </DropdownMenuRoot>
          </Flex>

          {/* Description */}
          <Text
            className={cn(
              "oui-text-[14px]",
              "oui-leading-[20px]",
              "oui-font-semibold",
              "oui-text-base-contrast-54",
            )}
          >
            {currentStage?.stage_description}
            <span
              className="oui-text-primary hover:oui-underline oui-cursor-pointer"
              onClick={handleLearnMore}
            >
              {" "}
              {t("tradingPoints.learnMore")}
            </span>
          </Text>
        </Flex>
      )}
      {/* Stage Points Cards */}
      <Flex
        direction={isMobile ? "column" : "row"}
        gap={6}
        className="oui-w-full"
      >
        {/* Stage Points & Ranking Card */}
        <Flex
          direction={isMobile ? "column" : "row"}
          gap={6}
          itemAlign={isMobile ? "stretch" : "center"}
          p={5}
          r="2xl"
          style={{ height: isMobile ? "" : 104 }}
          className={cn(
            "oui-border oui-border-line",
            !isMobile && "oui-gap-12",
            isMobile ? "oui-w-full" : "oui-flex-1",
          )}
        >
          <Flex
            direction="column"
            gap={2}
            className="oui-flex-1"
            itemAlign="start"
          >
            <Text className="oui-text-base-contrast-54 oui-text-sm oui-tracking-[0.03em]">
              {t("tradingPoints.stagePoints")}
            </Text>
            <Text className="oui-text-base-contrast oui-text-[28px] oui-tracking-[0.03em] oui-leading-9">
              {allTimePointsDisplay.currentPointsDisplay}
            </Text>
          </Flex>
          {!isMobile && (
            <Box
              className={cn("oui-w-[1px]", "oui-h-full", "oui-bg-white/[0.08]")}
            />
          )}
          {isMobile && <Divider intensity={8} />}
          <Flex
            direction="column"
            gap={2}
            className="oui-flex-1"
            itemAlign="start"
          >
            <Text className="oui-text-base-contrast-54 oui-text-sm oui-tracking-[0.03em]">
              {t("tradingPoints.stageRanking")}
            </Text>
            <Text className="oui-text-base-contrast oui-text-[28px] oui-tracking-[0.03em] oui-leading-9">
              {allTimePointsDisplay.rankingDisplay}
            </Text>
          </Flex>
        </Flex>

        {/* Referral Card */}
        <Flex
          p={5}
          r="2xl"
          style={{ height: 104 }}
          className={cn(
            "oui-border oui-border-line",
            isMobile ? "oui-w-full" : "oui-flex-1",
            "oui-h-[128px]",
          )}
        >
          <Flex direction="column" gap={4} className="oui-w-full">
            <Flex gap={2} itemAlign="center" className="oui-w-full">
              <Text className="oui-text-base-contrast-54 oui-text-sm oui-tracking-[0.03em]">
                {t("tradingPoints.referralCode")}
              </Text>
              <Flex
                gap={2}
                itemAlign="center"
                justify="end"
                className="oui-flex-1"
              >
                <Text className="oui-text-base-contrast oui-text-sm oui-tracking-[0.03em]">
                  {refCode}
                </Text>
                <CopyIcon
                  size={16}
                  className="oui-text-white hover:oui-cursor-pointer hover:oui-opacity-80 oui-transition-opacity"
                  onClick={onCopyCode}
                />
              </Flex>
            </Flex>
            <Flex gap={2} itemAlign="start" className="oui-w-full">
              <Text className="oui-text-base-contrast-54 oui-text-sm oui-tracking-[0.03em] oui-flex-shrink-0">
                {t("tradingPoints.referralLink")}
              </Text>
              <Flex
                gap={2}
                itemAlign="start"
                className="oui-flex-1 oui-min-w-0"
              >
                <Text className="oui-text-base-contrast oui-text-sm oui-tracking-[0.03em] oui-flex-1 oui-truncate oui-text-right">
                  {refLink}
                </Text>
                <CopyIcon
                  size={16}
                  className="oui-text-white hover:oui-cursor-pointer hover:oui-opacity-80 oui-transition-opacity"
                  onClick={onCopyLink}
                />
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};
