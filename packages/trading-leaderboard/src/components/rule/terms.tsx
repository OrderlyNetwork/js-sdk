import { FC } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { cn } from "@orderly.network/ui";
import { LeaderboardTitle } from "../../pages/leaderboard/page";
import { termsDescription } from "./constants";
import { DescriptionContent } from "./description";

type TermsUIProps = {
  className?: string;
  isMobile?: boolean;
};

export const CampaignTermsUI: FC<TermsUIProps> = ({ className, isMobile }) => {
  const { t } = useTranslation();
  return (
    <div className={cn("oui-mx-auto oui-max-w-[992px] oui-py-10", className)}>
      <LeaderboardTitle
        isMobile={isMobile}
        title={t("tradingLeaderboard.termsAndConditions")}
      />
      <DescriptionContent description={termsDescription} />
    </div>
  );
};
