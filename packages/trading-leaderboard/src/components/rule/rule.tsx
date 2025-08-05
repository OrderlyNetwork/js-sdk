import { FC } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { cn } from "@orderly.network/ui";
import { LeaderboardTitle } from "../../pages/leaderboard/page";
import { ruleDescription } from "./constants";
import { DescriptionContent } from "./description";

type RuleUIProps = {
  id: string;
  className?: string;
  isMobile?: boolean;
};

export const CampaignRuleUI: FC<RuleUIProps> = ({
  id,
  className,
  isMobile,
}) => {
  const { t } = useTranslation();
  return (
    <div
      className={cn("oui-mx-auto oui-max-w-[992px] oui-py-10", className)}
      id={id}
    >
      <LeaderboardTitle
        isMobile={isMobile}
        title={t("tradingLeaderboard.rules")}
      />
      <DescriptionContent description={ruleDescription} />
    </div>
  );
};
