import { useMemo } from "react";
import { useScreen } from "@kodiak-finance/orderly-ui";
import { Campaign } from "../../components/provider";

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

  const showCampaigns = useMemo(() => campaigns?.length > 0, [campaigns]);

  const isVideo = useMemo(() => {
    return isVideoSrc(backgroundSrc);
  }, [backgroundSrc]);

  return {
    backgroundSrc,
    isVideo,
    showCampaigns,
    isMobile,
  };
}
