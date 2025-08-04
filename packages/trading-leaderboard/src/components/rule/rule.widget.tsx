import { useScreen } from "@orderly.network/ui";
import { useCampaignsScript } from "../campaigns/campaigns.script";
import { CampaignRuleUI } from "./rule";
import { CampaignTermsUI } from "./terms";

export const RuleWidget = () => {
  const state = useCampaignsScript();
  const { isMobile } = useScreen();

  if (
    state.currentCampaignId === "general" ||
    !state.currentCampaign?.rule_config
  ) {
    return null;
  }

  return (
    <>
      <CampaignRuleUI
        id={state.currentCampaign.rule_url || ""}
        className={isMobile ? "oui-px-3" : ""}
        isMobile={isMobile}
      />
      <CampaignTermsUI
        className={isMobile ? "oui-px-3" : ""}
        isMobile={isMobile}
      />
    </>
  );
};
