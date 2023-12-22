"use client";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

const MainView = dynamic(() => import("./view"), { ssr: false });

const _orderlySymbolKey = "orderly-sdk-demo-symbol";

export default function PerpPage({ params }: { params: { symbol: string } }) {
  const router = useRouter();
  console.log("params", params);

  let symbol = params.symbol;
  if (symbol === undefined) {
    symbol = localStorage.getItem(_orderlySymbolKey) ?? "PERP_ETH_USDC";
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
