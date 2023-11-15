() => {
  const { state, account } = useAccount();

  return (
    <>
      <div>{`status: ${state.status}`}</div>
      <div>{`address: ${state.address}`}</div>
      <div className="flex mt-3 gap-3">
        <button disabled={state.status > AccountStatusEnum.NotSignedIn}>
          Crate Account
        </button>
        <button
          disabled={state.status > AccountStatusEnum.DisabledTrading}
          onClick={() => {
            account.createOrderlyKey(30);
          }}
        >
          Create Orderly Key
        </button>
      </div>
    </>
  );
};
