import { FC, useEffect, useState } from "react";
import { SortItem } from "../sections/sortItem";
import { useSort } from "../useSort";
import { cn } from "@/utils";
import { SortCondition, SortKey } from "../shared/types";
import { OrderlyIcon } from "@/icon";
import { Tooltip } from "@/tooltip";

interface Props {
  value?: SortKey;
  onChange: (values: SortCondition) => void;
  hasSuffix: boolean;
  readLastSortCondition?: boolean;
}

export const SortGroup: FC<Props> = (props) => {
  //   const onClick = (value: SortKey) => {
  //     console.log(value);
  //   };
  const [open, setOpen] = useState(false);

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
    <div
      className={cn(
        "orderly-grid orderly-grid-cols-5 orderly-text-3xs orderly-text-base-contrast-54 orderly-py-3 orderly-px-5 orderly-mt-2",
        props.hasSuffix && "orderly-grid-cols-6"
      )}
    >
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
      <div className="orderly-col-span-1 orderly-flex orderly-pl-2">
        
        <div className="orderly-flex-1"></div>
        <Tooltip content="24 hour total trading volume on the Orderly Network.">
          <div className="orderly-flex orderly-justify-end orderly-items-center">
            <OrderlyIcon size={14} className="orderly-mr-[6px]" />
            <SortItem
              label={"Volume"}
              value={"vol"}
              onClick={onSort}
              currentValue={currentValue}
            />
          </div>
        </Tooltip>
      </div>
    </div>
  );
};
