import React, { PropsWithChildren } from "react";
import { AbstractWalletProvider } from "./abstractWalletProvider";
import { InitAbstractProvider } from "./initAbstractProvider";

export  function AbstractWallet({children}: {children: React.ReactNode}) {
  return (
    <InitAbstractProvider>
      <AbstractWalletProvider>
        {children}
      </AbstractWalletProvider>
    </InitAbstractProvider>
    
  )
}