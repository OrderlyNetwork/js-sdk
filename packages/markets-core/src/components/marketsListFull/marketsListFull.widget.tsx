import type { DataTableClassNames } from "@orderly.network/ui";
import { SortType } from "../../type";
import {
  MarketsListFullType,
  useMarketsListFullScript,
} from "./marketsListFull.script";
import { MarketsListFull } from "./marketsListFull.ui";

export type MarketsListFullWidgetProps = {
  type?: MarketsListFullType;
  initialSort?: SortType;
  dataFilter?: (data: any[]) => any[];
  /** Hide an empty Perps table when another product supplies results. */
  hideEmptyTable?: boolean;
  tableClassNames?: DataTableClassNames;
};

export const MarketsListFullWidget: React.FC<MarketsListFullWidgetProps> = (
  props,
) => {
  const state = useMarketsListFullScript(props);

  return (
    <MarketsListFull
      {...state}
      type={props.type}
      hideEmptyTable={props.hideEmptyTable}
      tableClassNames={props.tableClassNames}
    />
  );
};
