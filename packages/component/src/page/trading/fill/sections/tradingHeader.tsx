import { FC, ReactNode } from "react";
import { useAccount } from "@orderly.network/hooks";
import { AccountStatus } from "@/block/accountStatus/accountStatus";

interface Props {
  logo?: ReactNode;
}

export const Header: FC<Props> = (props) => {
  const { state } = useAccount();
  return (
    <div className="orderly-h-[48px] orderly-flex">
      <div className="orderly-flex-1"></div>

      <AccountStatus
        status={state.status}
        address={state.address}
        chains={[]}
        accountInfo={undefined}
        className="orderly-mr-3"
      />
    </div>
  );
};
