() => {
  const { data, error, loading } = useQuery<API.Symbol[]>("/v1/public/info");

  return (
    <pre className="text-sm">
      {loading && <div>Loading...</div>}
      {data && (
        <div className="text-slate-500">{JSON.stringify(data, null, 2)}</div>
      )}
    </pre>
  );
};
