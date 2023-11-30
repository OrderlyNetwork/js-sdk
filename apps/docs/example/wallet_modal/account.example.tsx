import { useAccount } from "@orderly.network/hooks";

export const Account = () => {
  const { state } = useAccount();
  return (
    <div>
      <span>Account Status:</span>
      <span>{state.status}</span>
    </div>
  );
};
