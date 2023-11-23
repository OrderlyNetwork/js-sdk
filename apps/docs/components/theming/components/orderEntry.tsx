export const OrderEntryComponent = () => {
  return <OrderEntry
  {...formState}
  showConfirm
  side={side}
  onSideChange={setSide}
  symbol={symbol}
  onReduceOnlyChange={setReduceOnly}
  disabled={state.status < AccountStatusEnum.EnableTrading}
  onDeposit={onDeposit}
/>;
};
