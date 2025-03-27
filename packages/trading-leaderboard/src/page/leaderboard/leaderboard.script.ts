import { useMemo } from "react";

export type LeaderboardScriptReturn = ReturnType<typeof useLeaderboardScript>;

function isVideoSrc(src?: string) {
  const extension = src?.split(".").pop();
  return ["mp4", "webm", "avi", "ogg"].includes(extension ?? "");
}

export function useLeaderboardScript(backgroundSrc?: string) {
  const isVideo = useMemo(() => {
    return isVideoSrc(backgroundSrc);
  }, [backgroundSrc]);

  return {
    backgroundSrc,
    isVideo,
  };
}
