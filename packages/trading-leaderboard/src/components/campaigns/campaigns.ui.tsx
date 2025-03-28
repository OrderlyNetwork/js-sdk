import { FC } from "react";
import { cn, Box, Text, Flex, Button, Select } from "@orderly.network/ui";
import { useTranslation } from "@orderly.network/i18n";
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
      className={cn(
        "oui-trading-leaderboard-campaigns oui-rounded-[20px]",
        "oui-h-[280px]",
        props.className
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
          height={192}
          direction="column"
          r="xl"
          className="oui-pr-1.5"
        >
          {props.currentCampaigns.map((campaign) => {
            return <CampaignItem key={campaign.title} campaign={campaign} />;
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

const CampaignItem: FC<{ campaign: CurrentCampaigns }> = ({ campaign }) => {
  const { title, description, image, displayTime, learnMoreUrl, tradingUrl } =
    campaign;
  const { t } = useTranslation();

  return (
    <Flex intensity={800} r="xl">
      <img
        className="oui-w-[400px] oui-h-[192px] oui-rounded-xl"
        src={image}
        alt={title}
      />

      <Flex
        itemAlign="start"
        justify="between"
        direction="column"
        height="100%"
        p={5}
        className="oui-font-semibold"
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
                window.open(learnMoreUrl, "_blank");
              }}
            >
              {t("tradingLeaderboard.learnMore")}
            </Button>
            <Button
              size="md"
              onClick={() => {
                window.open(tradingUrl, "_self");
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
