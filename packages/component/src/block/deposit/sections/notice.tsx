import { FC, useContext } from "react";
import { DepositContext } from "../DepositProvider";
import { CurrentChain } from "@orderly.network/types";

interface NoticeProps {
  warningMessage?: string;
  notSupportChain?: boolean;
  currentChain: CurrentChain | null;
  onOpenPicker: () => Promise<any>;
}

export const Notice: FC<NoticeProps> = (props) => {
  const { warningMessage, currentChain } = props;
  const { needSwap, needCrossSwap } = useContext(DepositContext);

  if (warningMessage) {
    return (
      <div className="orderly-text-center orderly-text-warning orderly-text-3xs desktop:orderly-text-2xs">
        {warningMessage}
      </div>
    );
  }

  if (needCrossSwap) {
    return (
      <div className="orderly-text-center orderly-text-warning orderly-text-3xs orderly-py-2 desktop:orderly-text-2xs">
        <span>
          Cross-chain transaction fees will be charged. To avoid these, use our
          supported
        </span>
        <a
          className="orderly-text-primary-light orderly-px-1 orderly-cursor-pointer"
          onClick={(event) => {
            event.preventDefault();
            props.onOpenPicker();
          }}
        >
          Bridgeless networks
        </a>
        .
      </div>
    );
  }

  if (needSwap) {
    return (
      <div className="orderly-text-center orderly-text-warning orderly-text-3xs desktop:orderly-text-2xs">
        Please note that swap fees will be charged.
      </div>
    );
  }

  return <div></div>;
};
