import { ExtensionPosition, ExtensionPositionEnum } from "../../types";
import { installExtension } from "../../install";
import Comp from "./comp";

// const Comp = lazy(() => import("./comp"));

installExtension<{
  onOk: () => void;
}>({
  name: "swap-deposit",
  scope: ["*"],
  positions: [ExtensionPositionEnum.DepositForm],
})((props) => {
  console.log(props);
  return <Comp />;
});
