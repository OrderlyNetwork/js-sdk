import InitSolana from "./initSolana";
import {Main} from "./main";
import React, {type PropsWithChildren, useState} from "react";
import {EvmInitialProps, SolanaInitialProps} from "./types";

export interface WalletConnectorProviderProps {

    solanaInitial?: SolanaInitialProps;
    evmInitial?: EvmInitialProps;
}

export function WalletConnectorProvider(
    props: PropsWithChildren<WalletConnectorProviderProps>
) {

    return (
        <InitSolana {...(props.solanaInitial ?? {})}>

            <Main>
                {props.children}
            </Main>

        </InitSolana>
    );
}