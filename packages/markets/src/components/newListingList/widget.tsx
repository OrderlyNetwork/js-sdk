import { NewListingList } from "./newListingList.ui";
import { useNewListingListScript } from "./newListingList.script";
import { GetColumns } from "../../type";
import { DataTableClassNames } from "@orderly.network/ui";

export type NewListingListWidgetProps = {
  getColumns?: GetColumns;
  collapsed?: boolean;
  tableClassNames?: DataTableClassNames;
  rowClassName?: string;
};

export const NewListingListWidget: React.FC<NewListingListWidgetProps> = (
  props
) => {
  const state = useNewListingListScript();
  return <NewListingList {...state} {...props} />;
};
