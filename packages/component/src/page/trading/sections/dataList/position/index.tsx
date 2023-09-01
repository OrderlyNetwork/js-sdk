import React from "react";
import { PositionHeader } from "./positionHeader";
import { PositionsView } from "@/block/positions";
import { usePositionStream } from "@orderly.network/hooks";
import { modal } from "@/modal";
import { ClosePositionPane } from "@/block/positions/sections/closeForm";
import { API } from "@orderly.network/types";
import { LimitConfirm } from "@/block/positions/sections/limitConfirm";
import { MarkPriceConfirm } from "@/block/positions/sections/markPriceConfirm";

export const PositionPane = () => {
  const [data, info, { loading }] = usePositionStream();
  const onLimitClose = async (position: API.Position) => {
    console.log("onLimitClose", position);
    const result = await modal.sheet({
      title: "Limit Close",
      content: <ClosePositionPane position={position} />,
    });
  };

  const onMarketClose = async (position: API.Position) => {
    const result = await modal.confirm({
      title: "Market Close",
      content: <MarkPriceConfirm position={position} />,
    });
  };

  return (
    <PositionsView
      dataSource={data.rows}
      aggregated={data.aggregated}
      isLoading={loading}
      onLimitClose={onLimitClose}
      onMarketClose={onMarketClose}
    />
  );
};
