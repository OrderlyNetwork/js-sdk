import { FC } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { cn, Box, Text, Flex, Button, Select } from "@orderly.network/ui";
import { CampaignsScriptReturn, CurrentCampaigns } from "./campaigns.script";

export type CampaignsProps = {
  className?: string;
  style?: React.CSSProperties;
} & CampaignsScriptReturn;

const scrollIndicatorWidth = 25;
const scrollIndicatorHeight = 6;

export const MobileCampaigns: FC<CampaignsProps> = (props) => {
  if (props.currentCampaigns.length === 0) {
    return null;
  }

  return (
    <Box
      width="100%"
      intensity={900}
      p={3}
      className={cn(
        "oui-mobile-trading-leaderboard-campaigns oui-rounded-[20px]",
        props.className,
      )}
      style={props.style}
    >
      <Header {...props} />
      <Box
        r="xl"
        mt={3}
        ref={props.enableScroll ? props.emblaRef : undefined}
        className={cn(
          "oui-w-full oui-min-w-0 oui-overflow-hidden",
          "oui-select-none oui-cursor-pointer",
        )}
      >
        <Flex>
          {props.currentCampaigns.map((campaign) => {
            return <CampaignItem key={campaign.title} campaign={campaign} />;
          })}
        </Flex>
      </Box>
      {props.enableScroll && (
        <ScrollIndicator
          style={{
            width: scrollIndicatorWidth * props.currentCampaigns.length,
          }}
          list={props.currentCampaigns}
          scrollIndex={props.scrollIndex}
          scrollTo={props.emblaApi?.scrollTo}
        />
      )}
    </Box>
  );
};

const Header: FC<CampaignsScriptReturn> = (props) => {
  const { t } = useTranslation();

  return (
    <Flex justify="between" itemAlign="center">
      <Text size="base" intensity={80}>
        {t("tradingLeaderboard.campaigns")}
      </Text>
      <Select.options
        size={"xs"}
        value={props.category}
        onValueChange={props.onCategoryChange}
        options={props.options}
        classNames={{
          // set the width of the trigger to the width of the content
          trigger: "oui-w-[--radix-select-content-available-width]",
        }}
      />
    </Flex>
  );
};

const CampaignItem: FC<{ campaign: CurrentCampaigns }> = ({ campaign }) => {
  const { title, description, image, displayTime, learnMoreUrl, tradingUrl } =
    campaign;
  const { t } = useTranslation();

  return (
    <Box intensity={800} r="xl" className="oui-flex-[0_0_100%]">
      <img
        className="oui-w-full oui-h-[calc((100vw-48px)/2)] oui-rounded-t-xl oui-object-fill"
        src={image}
        alt={title}
      />

      <Flex
        itemAlign="start"
        justify="between"
        direction="column"
        height="100%"
        p={4}
        gapY={3}
        className="oui-font-semibold"
      >
        <Flex direction="column" itemAlign="start" gapY={1}>
          <Text size="sm">{title}</Text>
          <Text size="2xs" intensity={54}>
            {displayTime}
          </Text>
          <Text size="2xs" intensity={36}>
            {description}
          </Text>
        </Flex>
        <Flex justify="between" width="100%" gapX={3}>
          <Button
            variant="outlined"
            color="secondary"
            fullWidth
            size="md"
            onClick={() => {
              window.open(learnMoreUrl, "_blank");
            }}
          >
            {t("tradingLeaderboard.learnMore")}
          </Button>
          <Button
            size="md"
            fullWidth
            onClick={() => {
              window.open(tradingUrl, "_self");
            }}
          >
            {t("tradingLeaderboard.tradeNow")}
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};

interface ScrollIndicatorProps {
  style?: React.CSSProperties;
  list: CurrentCampaigns[];
  scrollIndex: number;
  scrollTo?: (index: number) => void;
}

const ScrollIndicator: React.FC<ScrollIndicatorProps> = (props) => {
  const { style, scrollIndex, list } = props;

  return (
    <Flex
      mt={3}
      r="full"
      height={scrollIndicatorHeight}
      className={cn("oui-bg-line oui-mx-auto oui-relative")}
      style={props.style}
    >
      {list.map((item, index) => {
        return (
          <Box
            key={index}
            width={scrollIndicatorWidth}
            height={scrollIndicatorHeight}
            onClick={() => {
              props.scrollTo?.(index);
            }}
            r="full"
            className="oui-cursor-pointer"
          />
        );
      })}
      <Box
        width={scrollIndicatorWidth}
        height={scrollIndicatorHeight}
        r="full"
        className={cn(
          "oui-absolute oui-left-0 oui-top-0",
          "oui-transition-all oui-duration-300",
          "oui-bg-primary",
        )}
        style={{
          transform: `translateX(${scrollIndex * scrollIndicatorWidth}px)`,
        }}
      />
    </Flex>
  );
};
