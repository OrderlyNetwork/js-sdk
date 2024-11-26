import { RecentList } from "./recentList.ui";
import { useRecentListScript } from "./recentList.script";
import { GetColumns } from "../../type";
import { DataTableClassNames } from "@orderly.network/ui";

export type RecentListWidgetProps = {
  getColumns?: GetColumns;
  collapsed?: boolean;
  tableClassNames?: DataTableClassNames;
  rowClassName?: string;
};

export const RecentListWidget: React.FC<RecentListWidgetProps> = (props) => {
  const state = useRecentListScript();
  return <RecentList {...state} {...props} />;
};
