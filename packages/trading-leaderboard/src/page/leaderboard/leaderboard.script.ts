import { useMemo } from "react";
import { useTradingLeaderboardContext } from "../../components/provider";

export type LeaderboardScriptReturn = ReturnType<typeof useLeaderboardScript>;

function isVideoSrc(src?: string) {
  const extension = src?.split(".").pop();
  return ["mp4", "webm", "avi", "ogg"].includes(extension ?? "");
}

export function useLeaderboardScript(backgroundSrc?: string) {
  const { campaigns = [] } = useTradingLeaderboardContext();

  const showCampaigns = useMemo(() => campaigns?.length > 0, [campaigns]);

  const isVideo = useMemo(() => {
    return isVideoSrc(backgroundSrc);
  }, [backgroundSrc]);

  return {
    backgroundSrc,
    isVideo,
    showCampaigns,
  };
}
