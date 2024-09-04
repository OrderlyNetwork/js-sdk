import React, { useRef } from "react";
import { TradingviewUIPropsInterface } from "../type";

export  function TradingviewUi(props: TradingviewUIPropsInterface) {
  return (
    <div>
      trading view
      <div id='sdk-tradingview' className='oui-h-full oui-w-full'>
         trading view chart3
      </div>
    </div>
  );
}