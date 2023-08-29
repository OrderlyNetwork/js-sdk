import React from "react";
import { PositionHeader } from "./positionHeader";
import { PositionsView } from "@/block/positions";
import { usePositionStream } from "@orderly.network/hooks";

export const PositionPane = () => {
  const [data, info, { loading }] = usePositionStream();
  return (
    <PositionsView
      dataSource={data.rows}
      aggregated={data.aggregated}
      isLoading={loading}
    />
  );
};
