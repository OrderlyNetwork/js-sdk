import { FC } from "react";

interface NoticeProps {
  needCrossChain: boolean;
  needSwap: boolean;
  warningMessage?: string;
}

export const Notice: FC<NoticeProps> = (props) => {
  const { needCrossChain, needSwap, warningMessage } = props;

  console.log({ needCrossChain, needSwap, warningMessage });

  if (warningMessage) {
    return (
      <div className="text-center text-warning text-sm">{warningMessage}</div>
    );
  }

  if (needCrossChain) {
    return (
      <div className="text-center text-warning text-sm py-2">
        <span>
          Please note that cross-chain transaction fees will be charged, or
          explore our supported
        </span>{" "}
        <span className="text-primary-light">Bridgeless networks</span>.
      </div>
    );
  }

  if (needSwap) {
    return (
      <div className="text-center text-warning text-sm">
        Please note that swap fees will be charged.
      </div>
    );
  }

  return <div></div>;
};
