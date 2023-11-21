import { useMemo } from "react";
import { usePrivateQuery } from "@orderly.network/hooks";
import { API } from "@orderly.network/types";

export const PositionTabTitle = () => {
  const { data: positions } = usePrivateQuery("/v1/positions");
  const positionCount = useMemo(() => {
    // @ts-ignore
    if (!positions || !positions.rows) return 0;
    // @ts-ignore
    return positions.rows.filter(
      (item: API.Position) => item.position_qty !== 0
    ).length;
  }, [positions]);

  if (positionCount === 0) {
    return "Positions";
  }

  return <>{`Positions(${positionCount})`}</>;
};
