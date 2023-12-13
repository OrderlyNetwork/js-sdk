import './App.css';
import React, {useRef, useState} from "react";
import TradingView from './tradingView/tradingView'
import {OrderlyConfigProvider} from '@orderly.network/hooks';

function App() {

    const brokerId = 'woofi_pro';

    const symbolList = ['PERP_APT_USDC', 'PERP_ETH_USDC'];

    const [currentSymbol, setCurrentSymbl] = useState<string>('PERP_ETH_USDC');

    return (
        <>
            <select onChange={(event) => setCurrentSymbl(event.target.value)} value={currentSymbol}>
                {symbolList.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
            <OrderlyConfigProvider brokerId={brokerId} networkId="testnet">
                <TradingView symbol={currentSymbol}/>
            </OrderlyConfigProvider>

        </>

    );
}

export default App;
