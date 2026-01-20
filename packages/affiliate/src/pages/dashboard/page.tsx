import { useAccount } from "@orderly.network/hooks";
import { useAppContext } from "@orderly.network/react-app";
import { AccountStatusEnum } from "@orderly.network/types";
import { cn, Flex, Spinner } from "@orderly.network/ui";
import { useReferralContext } from "../../provider";
import { LandingPage } from "../landing";
import { MultiLevelAffiliatePage } from "../multiLevel/affiliate";
import { TabWidget } from "./tab";

export const DashboardPage = (props: {
  classNames?: {
    root?: string;
    loadding?: string;
    home?: string;
    dashboard?: string;
  };
}) => {
  const { classNames = {} } = props;
  const { root, ...rest } = classNames;

  const { state } = useAccount();

  const { wrongNetwork, disabledConnect } = useAppContext();

  const {
    referralInfo,
    isMultiLevelEnabled,
    isMultiLevelReferralUnlocked,
    multiLevelRebateInfo,
    isAffiliate,
  } = useReferralContext();

  const loadingView = (
    <Flex justify={"center"} itemAlign={"center"} height={"100vh"}>
      <Spinner />
    </Flex>
  );

  if (state.validating) {
    return loadingView;
  }

  if (
    wrongNetwork ||
    disabledConnect ||
    (state.status < AccountStatusEnum.EnableTrading &&
      state.status !== AccountStatusEnum.EnableTradingWithoutConnected)
  ) {
    return <LandingPage />;
  }

  if (
    isMultiLevelEnabled === undefined ||
    isMultiLevelReferralUnlocked === undefined ||
    // legacy referral info
    referralInfo === undefined
  ) {
    return loadingView;
  }

  if (isMultiLevelEnabled) {
    /** If the user has a legacy referral code ( is an affiliate), show the multi-level affiliate page */
    if (multiLevelRebateInfo?.referral_code || isAffiliate) {
      return <MultiLevelAffiliatePage />;
    }

    /** If the user does not have a legacy or multi-level referral code, show the landing page */
    return <LandingPage />;
  }

  return (
    <div
      id="oui-affiliate-dashboard-page"
      className={cn("oui-w-full oui-tracking-tight", root)}
    >
      <TabWidget classNames={rest} />
    </div>
  );
};
