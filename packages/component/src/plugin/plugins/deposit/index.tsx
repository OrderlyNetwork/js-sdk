import { installOrderlyPlugin } from "../../install";

installOrderlyPlugin({
  name: "wooFI-swap-deposit",
  positions: ["deposit"],
})(() => {
  return <div>swap deposit</div>;
});
