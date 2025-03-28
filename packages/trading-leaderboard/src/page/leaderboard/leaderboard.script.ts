import { useMemo } from "react";
import { Campaign } from "../../components/provider";
import { useScreen } from "@orderly.network/ui";
import { useAccount } from "@orderly.network/hooks";
import { AccountStatusEnum } from "@orderly.network/types";
import { useAppContext } from "@orderly.network/react-app";

export type LeaderboardScriptReturn = ReturnType<typeof useLeaderboardScript>;

export type LeaderboardScriptOptions = {
  backgroundSrc?: string;
  campaigns?: Campaign[];
};

function isVideoSrc(src?: string) {
  const extension = src?.split(".").pop();
  return ["mp4", "webm", "avi", "ogg"].includes(extension ?? "");
}

export function useLeaderboardScript(options: LeaderboardScriptOptions) {
  const { backgroundSrc, campaigns = [] } = options;
  const { isMobile } = useScreen();
  const { state } = useAccount();
  const { wrongNetwork, disabledConnect } = useAppContext();

  const showCampaigns = useMemo(() => campaigns?.length > 0, [campaigns]);

  const canTrading =
    !wrongNetwork &&
    !disabledConnect &&
    (state.status >= AccountStatusEnum.EnableTrading ||
      state.status === AccountStatusEnum.EnableTradingWithoutConnected);

  const isVideo = useMemo(() => {
    return isVideoSrc(backgroundSrc);
  }, [backgroundSrc]);

  return {
    backgroundSrc,
    isVideo,
    showCampaigns,
    isMobile,
    canTrading,
  };
}
