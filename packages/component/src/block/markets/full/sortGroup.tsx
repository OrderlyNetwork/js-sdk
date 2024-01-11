import { FC, useEffect } from "react";
import { SortItem, SortKey } from "../sections/sortItem";
import { useSort } from "../useSort";
import { SortCondition } from "../sections/sortGroup";
import { cn } from "@/utils";

interface Props {
  value?: SortKey;
  onChange: (values: SortCondition) => void;
  hasSuffix: boolean;
} 

export const SortGroup: FC<Props> = (props) => {
  //   const onClick = (value: SortKey) => {
  //     console.log(value);
  //   };

  const {
    sortKey,
    onSort,
    direction,
    value: currentValue,
  } = useSort(props.value);

  useEffect(() => {
    props.onChange?.({ key: sortKey, direction });
  }, [sortKey, direction]);

  return (
    <div className={
      cn("orderly-grid orderly-grid-cols-5 orderly-text-3xs orderly-text-base-contrast-54 orderly-py-3 orderly-px-5 orderly-mt-2",
      props.hasSuffix && "orderly-grid-cols-6"
      )
    }>
      <div className="orderly-col-span-2">Instrument</div>
      <div className="orderly-col-span-1 orderly-flex orderly-justify-end">
        <SortItem
          label={"Last"}
          value={"price"}
          onClick={onSort}
          currentValue={currentValue}
        />
      </div>
      <div className="orderly-col-span-1 orderly-flex orderly-justify-end">
        <SortItem
          label={"24h%"}
          value={"change"}
          onClick={onSort}
          currentValue={currentValue}
        />
      </div>
      <div className="orderly-col-span-1 orderly-flex orderly-justify-end">
        <SortItem
          label={"Volume"}
          value={"vol"}
          onClick={onSort}
          currentValue={currentValue}
        />
      </div>
    </div>
  );
};
