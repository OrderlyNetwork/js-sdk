() => {
  const [symbol, setSymbol] = React.useState("PERP_ETH_USDC");
  const config = useSymbolsInfo();
  const symbolInfo = config ? config[symbol] : {};

  const [data, { onDepthChange, isLoading, onItemClick, depth, allDepths }] =
    useOrderbookStream(symbol, undefined, {
      level: 7,
    });

  return (
    <div className="bg-neutral-900 px-5 py-3 w-[300px] rounded-lg h-[480px]">
      <OrderBook
        level={7}
        asks={data.asks}
        bids={data.bids}
        markPrice={data.markPrice}
        lastPrice={data.middlePrice!}
        depth={allDepths}
        activeDepth={depth}
        base={symbolInfo("base")}
        quote={symbolInfo("quote")}
        isLoading={isLoading}
        onItemClick={onItemClick}
        onDepthChange={onDepthChange}
        cellHeight={22}
      />
    </div>
  );
};
