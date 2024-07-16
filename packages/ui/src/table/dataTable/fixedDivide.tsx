import { FC, memo, useContext, useMemo } from "react";
import { TableContext } from "./tableContext";

export const FixedDivide: FC = () => {
  const { getLeftFixedColumnsPosition, getRightFixedColumnsPosition, columns } =
    useContext(TableContext);

  const left = useMemo<number>(() => getLeftFixedColumnsPosition(), [columns]);
  const right = useMemo(() => getRightFixedColumnsPosition(), [columns]);

  const classNames =
    "oui-absolute oui-top-0 oui-bottom-0 oui-w-[1px] oui-bg-line-6 oui-z-30 oui-pointer-events-none oui-hidden";

  return (
    <>
      {left > 0 ? (
        <div
          id="table_left_fixed_divide"
          className={`${classNames} peer-data-[left=fixed]:oui-block oui-table-left-fixed-divide`}
          style={{ left: `${left}px` }}
        />
      ) : null}

      {right > 0 ? (
        <div
          id="table_right_fixed_divide"
          className={`${classNames} peer-data-[right=fixed]:oui-block oui-table-right-fixed-divide`}
          style={{ right: `${right}px` }}
        />
      ) : null}
    </>
  );
};
