() => {
  const { data, loading, error } = usePrivateQuery("/v1/client/info");
  const { state } = useAccount();

  if (loading) return <div>loading...</div>;

  return (
    <div>
      <div>{state.status}</div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};
