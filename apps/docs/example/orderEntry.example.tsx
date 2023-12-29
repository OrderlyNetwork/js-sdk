() => {
  const { state } = useAccount();

  const [symbol, setSymbol] = React.useState("PERP_ETH_USDC");

  const [side, setSide] = React.useState(OrderSide.BUY);
  const [reduceOnly, setReduceOnly] = React.useState(false);
  const formState = useOrderEntry(symbol, side, reduceOnly);

  return (
    <div className="bg-neutral-900 p-5 w-[360px] rounded-lg">
      <OrderEntry
        {...formState}
        showConfirm
        side={side}
        onSideChange={setSide}
        symbol={symbol}
        reduceOnly={reduceOnly}
        onReduceOnlyChange={setReduceOnly}
        disabled={state.status < AccountStatusEnum.EnableTrading}
        onDeposit={() => {}}
      />
    </div>
  );
};
