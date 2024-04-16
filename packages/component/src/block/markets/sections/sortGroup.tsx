import { OrderlyIcon } from "@/icon";
import { SortCondition, SortDirection, type SortKey } from "../shared/types";
import { useSort } from "../useSort";
import { SortItem } from "./sortItem";
import { FC, useEffect, useMemo, useState } from "react";

interface Props {
  value?: SortKey;
  onChange: (values: SortCondition) => void;
  readLastSortCondition?: boolean;
}

export const SortGroup: FC<Props> = (props) => {
  const {
    sortKey,
    onSort,
    direction,
    value: currentValue,
  } = useSort(props.value, props.readLastSortCondition);

  useEffect(() => {
    props.onChange?.({ key: sortKey, direction });
  }, [sortKey, direction]);

  return (
    <div className="orderly-flex orderly-justify-between orderly-text-4xs orderly-pt-5 orderly-pb-3 orderly-text-base-contrast-36">
      <div className="orderly-flex orderly-items-center orderly-gap-1">
        <div>Instrument</div>
        <div>/</div>
        <OrderlyIcon size={14} className="orderly-mx-[2px]" />
        <SortItem
          label={"Vol."}
          value={"vol"}
          onClick={onSort}
          currentValue={currentValue}
        />
      </div>
      <div className="orderly-flex orderly-items-center orderly-gap-1">
        <SortItem
          label={"Price"}
          value={"price"}
          onClick={onSort}
          currentValue={currentValue}
        />
        <div>/</div>
        <SortItem
          label={"Change%"}
          value={"change"}
          onClick={onSort}
          currentValue={currentValue}
        />
      </div>
    </div>
  );
};
