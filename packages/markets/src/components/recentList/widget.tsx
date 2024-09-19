import { RecentList } from "./recentList.ui";
import { useRecentListScript } from "./recentList.script";

export const RecentListWidget: React.FC = () => {
  const state = useRecentListScript();
  return <RecentList {...state} />;
};
