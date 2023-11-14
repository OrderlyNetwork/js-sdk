() => {
  const { data } = useMarketsStream();

  return (
    <div className="text-sm">
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};
