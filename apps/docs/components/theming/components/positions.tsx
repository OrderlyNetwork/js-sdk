import { useState } from "react";
import { useAccount, usePositionStream } from "@orderly.network/hooks";
import { PositionsViewFull, DataListView } from "@orderly.network/react";
import { AccountStatusEnum } from "@orderly.network/types";

export const PositionsComponent = () => {
  const [showAllSymbol, setShowAllSymbol] = useState(false);
  const [data, info, { loading }] = usePositionStream();
  const { state } = useAccount();

  return <DataListView />;
};
