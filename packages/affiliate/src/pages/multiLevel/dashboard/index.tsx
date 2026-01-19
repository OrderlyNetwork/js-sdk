import { Flex, Spinner } from "@orderly.network/ui";
import { useReferralContext } from "../../../provider";
import { LandingPage } from "../../landing";
import { MultiLevelAffiliatePage } from "../affiliate";

export const MultiLevelDashboardPage = () => {
  const {
    referralInfo,
    isMultiLevelEnabled,
    isMultiLevelReferralUnlocked,
    multiLevelRebateInfo,
    isAffiliate,
  } = useReferralContext();

  if (
    isMultiLevelEnabled === undefined ||
    isMultiLevelReferralUnlocked === undefined ||
    // legacy referral info
    referralInfo === undefined
  ) {
    return (
      <Flex justify={"center"} itemAlign={"center"} height={"100vh"}>
        <Spinner />
      </Flex>
    );
  }

  /** If the user has a legacy referral code ( is an affiliate), show the multi-level affiliate page */
  if (multiLevelRebateInfo?.referral_code || isAffiliate) {
    return <MultiLevelAffiliatePage />;
  }

  /** If the user does not have a legacy or multi-level referral code, show the landing page */
  return <LandingPage />;
};
