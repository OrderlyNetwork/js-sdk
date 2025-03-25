import { useMemo } from "react";

export type LeaderboardScriptReturn = ReturnType<typeof useLeaderboardScript>;

export function useLeaderboardScript(backgroundSrc?: string) {
  // const isVideo = useMemo(() => {
  //   return backgroundSrc?.endsWith(".mp4");
  // }, [backgroundSrc]);

  return {
    backgroundSrc,
    // isVideo,
  };
}
