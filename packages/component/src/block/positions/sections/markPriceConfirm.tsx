import { API } from "@orderly.network/types";
import { FC, useMemo } from "react";
import { useSymbolsInfo, useQuery } from "@orderly.network/hooks";

interface Props {
  position: API.Position;
}

export const MarkPriceConfirm: FC<Props> = (props) => {
  const { position } = props;
  const symbolInfo = useSymbolsInfo()[position?.symbol];
  const base = useMemo(() => symbolInfo("base"), [symbolInfo]);

  return (
    <div>
      <div
        id="orderly-market-close-dialog-content"
        className="orderly-text-2xs orderly-text-base-contrast-54 desktop:orderly-text-sm"
      >
        You will close{" "}
        <span className="orderly-text-warning">{`${position.position_qty} ${base}`}</span>{" "}
        position at market price.
      </div>
    </div>
  );
};
