import { FC, memo, useContext, useMemo } from "react";
import { TableContext } from "./tableContext";

export const FixedDivide: FC = () => {
  const { getLeftFixedColumnsPosition, getRightFixedColumnsPosition, columns } =
    useContext(TableContext);

  const left = useMemo<number>(() => getLeftFixedColumnsPosition(), [columns]);
  const right = useMemo(() => getRightFixedColumnsPosition(), [columns]);

  const classNames =
    "orderly-absolute orderly-top-0 orderly-bottom-0 orderly-w-[1px] orderly-bg-divider orderly-z-30 orderly-pointer-events-none orderly-hidden";

  return (
    <>
      {left > 0 ? (
        <div
          id="table_left_fixed_divide"
          className={`${classNames} peer-data-[left=fixed]:orderly-block table-left-fixed-divide`}
          style={{ left: `${left}px` }}
        ></div>
      ) : null}

      {right > 0 ? (
        <div
          id="table_right_fixed_divide"
          className={`${classNames} peer-data-[right=fixed]:orderly-block table-right-fixed-divide`}
          style={{ right: `${right}px` }}
        ></div>
      ) : null}
    </>
  );
};
