() => {
  const [symbol, setSymbol] = React.useState("PERP_ETH_USDC");
  const [data, { depth, allDepths, onDepthChange, isLoading }] =
    useOrderbookStream(symbol);

  return (
    <div className="text-sm">
      <div>
        <select
          className="border"
          onChange={(event) => onDepthChange(event.target.value)}
          value={depth}
        >
          {allDepths.map((depth, index) => {
            return (
              <option key={index} value={depth}>
                {depth}
              </option>
            );
          })}
        </select>
      </div>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-2 text-sm">
          <pre>{JSON.stringify(data.bids, null, 2)}</pre>

          <pre>{JSON.stringify(data.asks, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};
