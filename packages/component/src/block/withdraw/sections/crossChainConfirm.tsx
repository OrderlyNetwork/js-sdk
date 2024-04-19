import { NetworkImage } from "@/icon";
import { Numeral } from "@/text/numeral";
import { FC } from "react";

export interface CrossChainConfirmProps {
    address: string;
    chain: any;
    amount: number;
}

export const CrossChainConfirm: FC<CrossChainConfirmProps> = (props) => {

    const { address, chain, amount } = props;

    return (<div id="orderly-cross-chain-confirm">
        <Title title="Recipient address" />
        <SubTitle subtitle={address} />

        <Title title="Recipient network" />
        <SubTitle subtitle={(<div className="orderly-flex orderly-items-center">
            <NetworkImage type="chain" id={chain?.info?.network_infos?.chain_id} rounded size={11} />
            <span className="orderly-ml-2 orderly-text-base orderly-font-simibold orderly-text-base-contrast/90">{chain?.info?.network_infos?.name}</span>
        </div>)} />

        <Title title="Withdraw amount (USDC)" />
        <SubTitle subtitle={(
            <Numeral>{amount}</Numeral>
        )} />
        <div>
            <span className="orderly-text-warning orderly-text-3xs">Withdrawals that require cross-chain rebalancing can't be cancelled or followed up with more withdrawals until they've been processed.</span>
        </div>
    </div>);
}

const Title: FC<{ title: string }> = ({ title }) => {
    return (<div className="orderly-font-simibold orderly-text-sm orderly-text-base-contrast/30 orderly-withdraw-rebalance-title">
        {title}
    </div>)
}

const SubTitle: FC<{ subtitle: string | React.ReactNode }> = ({ subtitle }) => {
    return (<div className="orderly-mb-3 orderly-font-simibold orderly-text-base orderly-text-base-contrast/90 orderly-break-all orderly-withdraw-rebalance-subtitle">
        {subtitle}
    </div>)
}