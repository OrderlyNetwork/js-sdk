import { FC } from "react";
import { cn, Box, Text, Flex, Button, Select } from "@orderly.network/ui";
import { CampaignsScriptReturn, CurrentCampaigns } from "./campaigns.script";

export type CampaignsProps = {
  className?: string;
  style?: React.CSSProperties;
} & CampaignsScriptReturn;

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
        props.className
      )}
      style={props.style}
    >
      <Header {...props} />
      <Box r="xl" mt={3}>
        <Flex direction="column" r="xl">
          {props.currentCampaigns.map((campaign) => {
            return <CampaignItem key={campaign.title} campaign={campaign} />;
          })}
        </Flex>
      </Box>
    </Box>
  );
};

const Header: FC<CampaignsScriptReturn> = (props) => {
  return (
    <Flex justify="between" itemAlign="center">
      <Text size="base" intensity={80}>
        Campaigns
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

  return (
    <Box intensity={800} r="xl">
      <img
        className="oui-w-full oui-h-[120px] oui-rounded-t-xl oui-object-cover"
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
            Learn more
          </Button>
          <Button
            size="md"
            fullWidth
            onClick={() => {
              window.open(tradingUrl, "_self");
            }}
          >
            Trade now
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};
