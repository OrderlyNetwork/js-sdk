import './App.css';
import React, {useRef} from "react";
import TradingView from './tradingView/tradingView'
import { OrderlyConfigProvider } from '@orderly.network/hooks';
function App() {

    const brokerId = 'woofi_pro';

  return (
      <>
          <OrderlyConfigProvider brokerId={brokerId} networkId="testnet">
              <TradingView/>
          </OrderlyConfigProvider>

      </>

  );
}

export default App;
