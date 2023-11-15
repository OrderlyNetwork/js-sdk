() => {
  const [chains] = useChains();

  return (
    <div>
      <pre>{JSON.stringify(chains, null, 2)}</pre>
    </div>
  );
};
