"use client";

import "@orderly.network/react/dist/styles.css";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";

// export function

const MainView = dynamic(() => import("./view"), { ssr: false });

export default function PerpPage({ params }: { params: { symbol: string } }) {
  const symbol = params.symbol.startsWith("PERP_")
    ? params.symbol
    : `PERP_${params.symbol}`;

  return <MainView symbol={symbol} onSymbolChange={(symbol) => {}} />;
}
