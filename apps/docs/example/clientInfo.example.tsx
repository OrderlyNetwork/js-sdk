() => {
  const { data, loading, error } = usePrivateQuery("/v1/client/info");

  if (loading) return <div>loading...</div>;

  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};
