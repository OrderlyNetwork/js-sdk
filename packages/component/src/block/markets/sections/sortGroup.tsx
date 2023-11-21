import { SortDirection, SortItem, type SortKey } from "./sortItem";
import { FC, useEffect, useMemo, useState } from "react";

export type SortCondition = Partial<{ key: SortKey; direction: SortDirection }>;

interface Props {
  value?: SortKey;
  onChange: (values: SortCondition) => void;
}

export const SortGroup: FC<Props> = (props) => {
  const [sortKey, setSortKey] = useState<SortKey | undefined>(props.value);
  const [direction, setDirection] = useState<SortDirection>(SortDirection.NONE);

  const onClick = (value: SortKey) => {
    if (value === sortKey) {
      setDirection((d) => {
        if (d === SortDirection.NONE) {
          return SortDirection.DESC;
        } else if (d === SortDirection.DESC) {
          return SortDirection.ASC;
        } else {
          return SortDirection.NONE;
        }
      });
    } else {
      setSortKey(value);
      setDirection(SortDirection.DESC);
    }
  };

  const currentValue = useMemo(
    () => ({
      key: sortKey,
      direction: direction,
    }),
    [sortKey, direction]
  );

  useEffect(() => {
    props.onChange?.({ key: sortKey, direction });
  }, [sortKey, direction]);

  return (
    <div className={"flex justify-between text-4xs pt-5 pb-3 text-tertiary"}>
      <div className={"flex items-center gap-1"}>
        <div>Instrument</div>
        <div>/</div>
        <SortItem
          label={"Vol."}
          value={"vol"}
          onClick={onClick}
          currentValue={currentValue}
        />
      </div>
      <div className={"flex items-center gap-1"}>
        <SortItem
          label={"Price"}
          value={"price"}
          onClick={onClick}
          currentValue={currentValue}
        />
        <div>/</div>
        <SortItem
          label={"Change%"}
          value={"change"}
          onClick={onClick}
          currentValue={currentValue}
        />
      </div>
    </div>
  );
};
