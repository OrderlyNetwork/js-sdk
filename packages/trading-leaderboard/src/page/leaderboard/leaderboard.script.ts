import { useMemo } from "react";

export type LeaderboardScriptReturn = ReturnType<typeof useLeaderboardScript>;

export function useLeaderboardScript(backgroundSrc?: string) {
  const isVideo = useMemo(() => {
    const extension = backgroundSrc?.split(".").pop();
    return ["mp4", "webm", "avi", "ogg"].includes(extension ?? "");
  }, [backgroundSrc]);

  return {
    backgroundSrc,
    isVideo,
  };
}
