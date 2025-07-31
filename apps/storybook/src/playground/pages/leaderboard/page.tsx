import { useMemo } from "react";
import {
  Campaign,
  LeaderboardWidget,
} from "@orderly.network/trading-leaderboard";
import { Box, useScreen } from "@orderly.network/ui";
import { useScaffoldContext } from "@orderly.network/ui-scaffold";
import { BaseLayout } from "../../components/layout/baseLayout";
import { PathEnum } from "../../constant";
import { getSymbol } from "../../storage";
import { generateLocalePath } from "../../utils";

function getCampaigns() {
  const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const dateRange = [
    // ongoing
    { startTime: addDays(new Date(), -1), endTime: addDays(new Date(), 30) },
    // future
    { startTime: addDays(new Date(), 1), endTime: addDays(new Date(), 30) },
    // past
    { startTime: addDays(new Date(), -30), endTime: addDays(new Date(), -1) },
  ];

  return dateRange.map(
    (date) =>
      ({
        title: "RISE ABOVE. OUTTRADE THE REST",
        description:
          "A new era of traders is rising. Are you the one leading the charge? Compete for your share of $10K by climbing the ranks. Only the bold will make it to the top.",
        image: "/leaderboard/campaign.jpg",
        href: "https://orderly.network/",
        ...date,
      }) as Campaign,
  );
}

export default function LeaderboardPage() {
  const { isMobile, isDesktop } = useScreen();

  return (
    <div className="orderly-sdk-layout">
      <BaseLayout
        initialMenu={PathEnum.Leaderboard}
        classNames={{
          root: isDesktop ? "oui-overflow-hidden" : undefined,
        }}
      >
        <LeaderboardView isMobile={isMobile} />
      </BaseLayout>
    </div>
  );
}

const LeaderboardView = (props: { isMobile: boolean }) => {
  const { topNavbarHeight, footerHeight, announcementHeight } =
    useScaffoldContext();

  const tradingUrl = useMemo(() => {
    const symbol = getSymbol();
    return generateLocalePath(`${PathEnum.Perp}/${symbol}`);
  }, []);

  return (
    <Box
      style={{
        minHeight: 379,
        maxHeight: 2560,
        overflow: "hidden",
        height: props.isMobile
          ? "100%"
          : `calc(100vh - ${topNavbarHeight}px - ${footerHeight}px - ${
              announcementHeight ? announcementHeight + 12 : 0
            }px)`,
      }}
    >
      <LeaderboardWidget
        campaigns={getCampaigns()}
        href={{
          trading: tradingUrl,
        }}
        className="oui-py-5"
      />
    </Box>
  );
};
