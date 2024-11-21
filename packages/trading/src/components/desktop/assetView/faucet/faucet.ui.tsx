import { Button } from "@orderly.network/ui";
import { FaucetState } from "./faucet.script";

export function FaucetUi(props: FaucetState) {
  if (!props.showFaucet) {
   return null;
  }
  return (
      <Button
        variant="outlined"
        fullWidth
        size="md"
        onClick={props.getFaucet}
        loading={props.loading}
        className='oui-text-primary-light oui-border-primary-light oui-rounded'
      >Get test USDC</Button>
  )
}