import { ExtensionPosition } from "@/plugin/types";
import { installExtension } from "../../install";

installExtension({
  name: "wooFi-pro-swap-deposit",
  positions: [ExtensionPosition.DepositForm],
})(() => {
  return <div>swap deposit</div>;
});
