import { FC } from "react";
import { Flex, cn, useScreen } from "@orderly.network/ui";
import { GeneralLeaderboardWidget } from "../../components/leaderboard/generalLeaderboard";
import { usePoints } from "../../hooks/usePointsData";
import { Countdown } from "./countdown";
import { FAQSection } from "./faq";
import { Intro } from "./intro";
import { RouteOption } from "./page";
import { User } from "./user";

type MainProps = {
  onRouteChange: (option: RouteOption) => void;
};

const Main: FC<MainProps> = ({ onRouteChange }) => {
  const { isMobile } = useScreen();
  const { isNoCampaign, isCurrentStagePending } = usePoints();
  return (
    <Flex
      direction="column"
      gap={isMobile ? 6 : 10}
      className={cn(
        "oui-w-full",
        isMobile
          ? "oui-px-5 oui-py-6"
          : "oui-max-w-[1200px] oui-mx-auto oui-py-[64px] oui-py-12",
      )}
    >
      <Countdown />
      <Intro />
      {!isNoCampaign && (
        <>
          <User onRouteChange={onRouteChange} />
          {!isCurrentStagePending && <GeneralLeaderboardWidget />}
        </>
      )}
      <FAQSection className="oui-w-full" />
    </Flex>
  );
};

export default Main;
