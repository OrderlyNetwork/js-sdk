import { FC } from "react";
import { useTranslation } from "@veltodefi/i18n";
import { cn, Box, Text, Flex, Button, Select } from "@veltodefi/ui";
import { CampaignsScriptReturn, CurrentCampaigns } from "./campaigns.script";

export type CampaignsProps = {
  className?: string;
  style?: React.CSSProperties;
} & CampaignsScriptReturn;

export const Campaigns: FC<CampaignsProps> = (props) => {
  if (props.currentCampaigns.length === 0) {
    return null;
  }

  return (
    <Box
      width="100%"
      intensity={900}
      p={5}
      pr={2}
      height={288}
      className={cn(
        "oui-trading-leaderboard-campaigns oui-rounded-[20px]",
        props.className,
      )}
      style={props.style}
    >
      <Header {...props} />
      <Box
        mt={5}
        r="xl"
        className={cn("oui-overflow-y-auto", "oui-custom-scrollbar")}
      >
        <Flex
          gapY={5}
          height={200}
          direction="column"
          r="xl"
          className="oui-pr-1.5"
        >
          {props.currentCampaigns.map((campaign) => {
            return (
              <CampaignItem
                key={campaign.title}
                campaign={campaign}
                onLearnMore={props.onLearnMore}
                onTradeNow={props.onTradeNow}
              />
            );
          })}
        </Flex>
      </Box>
    </Box>
  );
};

const Header: FC<CampaignsScriptReturn> = (props) => {
  const { t } = useTranslation();
  return (
    <Flex justify="between" itemAlign="center" pr={3}>
      <Text size="xl">{t("tradingLeaderboard.campaigns")}</Text>
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

type CampaignItemProps = {
  campaign: CurrentCampaigns;
  onLearnMore: (campaign: CurrentCampaigns) => void;
  onTradeNow: (campaign: CurrentCampaigns) => void;
};

const CampaignItem: FC<CampaignItemProps> = ({
  campaign,
  onLearnMore,
  onTradeNow,
}) => {
  const { title, description, image, displayTime } = campaign;
  const { t } = useTranslation();

  return (
    <Flex intensity={800} r="xl" width="100%">
      <img
        className="oui-h-[200px] oui-w-[400px] oui-rounded-l-xl oui-object-fill"
        src={image}
        alt={title}
      />

      <Flex
        itemAlign="start"
        justify="between"
        direction="column"
        height="100%"
        p={5}
        className="oui-flex-1 oui-font-semibold"
      >
        <Flex gap={1} direction="column" itemAlign="start">
          <Text size="xl">{title}</Text>
          <Text size="sm" intensity={36}>
            {description}
          </Text>
        </Flex>
        <Flex justify="between" width="100%">
          <Text size="xs" intensity={54}>
            {displayTime}
          </Text>
          <Flex gap={3}>
            <Button
              variant="outlined"
              color="secondary"
              size="md"
              onClick={() => {
                onLearnMore(campaign);
              }}
            >
              {t("tradingLeaderboard.learnMore")}
            </Button>
            <Button
              size="md"
              onClick={() => {
                onTradeNow(campaign);
              }}
            >
              {t("tradingLeaderboard.tradeNow")}
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};
