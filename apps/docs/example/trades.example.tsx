() => {
  const { data, isLoading } = useMarketTradeStream("PERP_ETH_USDC");

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {data.map((item) => {
        return (
          <div key={item.ts} className="flex justify-between border-b">
            <span>{item.price}</span>
            <span>{item.size}</span>
            <span>{item.side}</span>
          </div>
        );
      })}
    </div>
  );
};
