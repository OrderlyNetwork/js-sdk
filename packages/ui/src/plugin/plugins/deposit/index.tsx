import { ExtensionPositionEnum, installExtension } from "../..";
import Comp from "./comp";

// const Comp = lazy(() => import("./comp"));

installExtension<{
  onOk: () => void;
}>({
  name: "deposit-form",
  scope: ["*"],
  positions: [ExtensionPositionEnum.DepositForm],
})((props: any) => {
  const { position, ...rest } = props;
  return <Comp {...rest} />;
});
