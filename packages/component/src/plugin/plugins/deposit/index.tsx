import { Suspense, lazy } from "react";
import { ExtensionPosition } from "@/plugin/types";
import { installExtension } from "../../install";

const Comp = lazy(() => import("./comp"));

installExtension<{
  onOk: () => void;
}>({
  name: "wooFi-pro-swap-deposit",
  scope: ["*"],
  positions: [ExtensionPosition.DepositForm],
})((props) => {
  console.log(props);
  return (
    <Suspense fallback={"loading..."}>
      <Comp />
    </Suspense>
  );
});
