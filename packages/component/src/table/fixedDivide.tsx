import { FC, memo, useContext, useMemo } from "react";
import { TableContext } from "./tableContext";

export const FixedDivide: FC = () => {
  const { getLeftFixedColumnsPosition, getRightFixedColumnsPosition } =
    useContext(TableContext);

  const left = useMemo<number>(() => getLeftFixedColumnsPosition(), []);
  const right = useMemo(() => getRightFixedColumnsPosition(), []);

  const classNames =
    "orderly-absolute orderly-top-0 orderly-bottom-0 orderly-w-[1px] orderly-bg-divider orderly-z-30 orderly-pointer-events-none orderly-hidden";

  return (
    <>
      {left > 0 ? (
        <div
          id="table_left_fixed_divide"
          className={`${classNames} peer-data-[left=fixed]:orderly-block`}
          style={{ left: `${left}px` }}
        ></div>
      ) : null}

      {right > 0 ? (
        <div
          id="table_right_fixed_divide"
          className={`${classNames} peer-data-[right=fixed]:orderly-block`}
          style={{ right: `${right}px` }}
        ></div>
      ) : null}
    </>
  );
};
