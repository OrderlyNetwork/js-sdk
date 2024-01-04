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

    return (<div>
        <Title title="Recipient address" />
        <SubTitle subtitle={address} />

        <Title title="Recipient network" />
        <SubTitle subtitle={(<div className="flex items-center">
            <NetworkImage type="chain" id={chain?.info?.network_infos?.chain_id} rounded size={11} />
            <span className="ml-2 text-base font-simibold text-base-contrast/90">{chain?.info?.network_infos?.name}</span>
        </div>)} />

        <Title title="Withdraw amount (USDC)" />
        <SubTitle subtitle={(
            <Numeral>{amount}</Numeral>
        )} />
        <div>
            <span className="text-warning text-base ">Withdrawals that require cross-chain rebalancing can't be cancelled or followed up with more withdrawals until they've been processed.</span>
        </div>
    </div>);
}

const Title: FC<{ title: string }> = ({ title }) => {
    return (<div>
        <span className="font-simibold text-sm text-base-contrast/30">{title}</span>
    </div>)
}

const SubTitle: FC<{ subtitle: string | React.ReactNode }> = ({ subtitle }) => {
    return (<div className="mb-3">
        <span className="font-simibold text-base text-base-contrast/90">{subtitle}</span>
    </div>)
}