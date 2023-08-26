export const HookDemo = <T,>(props: { data: T }) => {
  return (
    <div className="text-black">
      <div className="text-lg">Account Info</div>
      ------------------------
      <div>
        <pre>{JSON.stringify(props.data, null, 2)}</pre>
      </div>
    </div>
  );
};
