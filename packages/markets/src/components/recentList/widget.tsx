import { RecentList } from "./recentList.ui";
import { useRecentListScript } from "./recentList.script";
import { GetColumns } from "../../type";

export type RecentListWidgetProps = {
  getColumns?: GetColumns;
  collapsed?: boolean;
};

export const RecentListWidget: React.FC<RecentListWidgetProps> = (props) => {
  const state = useRecentListScript();
  return <RecentList {...state} {...props} />;
};
