"use client";
import dynamic from "next/dynamic";
import { redirect, useRouter } from "next/navigation";

// import { installExtension, ExtensionPosition } from "@orderly.network/react";

// installExtension({
//   name: "test",
//   positions: [ExtensionPosition.DepositForm],
// })(<div>test</div>);

type Props = {
  params: { symbol: string };
};

const MainView = dynamic(() => import("./view"), { ssr: false });

const _orderlySymbolKey = "orderly-sdk-demo-symbol";

export default function PerpPage({ params }: { params: { symbol: string } }) {
  const router = useRouter();

  let symbol = params.symbol;
  if (typeof symbol === "undefined") {
    // symbol = localStorage.getItem(_orderlySymbolKey) ?? "PERP_ETH_USDC";
    redirect(`/perp/PERP_ETH_USDC`);
  }

  return (
    <MainView
      symbol={symbol}
      onSymbolChange={(symbol) => {
        console.log("onSymbolChange", symbol);
        localStorage.setItem(_orderlySymbolKey, symbol.symbol);
        router.push(`/perp/${symbol.symbol}`);
      }}
    />
  );
}
