import { FC } from "react";
import { cn, Box, Text, Flex, Button, Select } from "@orderly.network/ui";
import { CampaignsScriptReturn } from "./campaigns.script";
import { Campaign } from "../provider";
import { formatCampaignDate } from "../../utils";

export type CampaignsProps = {
  className?: string;
} & CampaignsScriptReturn;

export const Campaigns: FC<CampaignsProps> = (props) => {
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
            let learnMoreUrl: string;
            let tradingUrl = props.tradingUrl;

            if (typeof campaign.href === "object") {
              learnMoreUrl = campaign.href.learnMore;
              tradingUrl = campaign.href.trading;
            } else {
              learnMoreUrl = campaign.href;
            }

            return (
              <CampaignItem
                key={campaign.title}
                campaign={{
                  ...campaign,
                  href: {
                    learnMore: learnMoreUrl,
                    trading: tradingUrl!,
                  },
                }}
              />
            );
          })}
        </Flex>
      </Box>
    </Box>
  );
};

const Header: FC<CampaignsScriptReturn> = (props) => {
  return (
    <Flex justify="between" itemAlign="center" pr={3}>
      <Text size="xl">Campaigns</Text>
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

const CampaignItem: FC<{ campaign: Campaign }> = ({ campaign }) => {
  const { title, description, image, href, startTime, endTime } = campaign;

  const time = `${formatCampaignDate(startTime)} - ${formatCampaignDate(
    endTime
  )}`;

  const learnMoreUrl = typeof href === "string" ? href : href.learnMore;
  const tradingUrl = typeof href === "string" ? href : href.trading;

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
            {time} UTC
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
              Learn more
            </Button>
            <Button
              size="md"
              onClick={() => {
                window.open(tradingUrl, "_self");
              }}
            >
              Trade now
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};
