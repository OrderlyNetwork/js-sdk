() => {
  const { data, error, isLoading } = useQuery<API.Symbol[]>("/v1/public/info");

  return (
    <>
      <pre className="text-sm">
        {isLoading && <div>Loading...</div>}
        {data && (
          <div className="text-slate-500">{JSON.stringify(data, null, 2)}</div>
        )}
      </pre>
    </>
  );
};
