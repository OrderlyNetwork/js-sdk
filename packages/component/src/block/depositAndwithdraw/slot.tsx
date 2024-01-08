import { ExtensionPosition } from "@/plugin";
import { installExtension } from "@/plugin/install";
import { ExtensionSlot } from "@/plugin/slot";
// import { lazy, Suspense } from "react";
import { Deposit } from "../deposit/deposit";

// const Deposit = lazy(() => import("../deposit/deposit"));

installExtension<{ onOk: () => void }>({
  name: "default-deposit",
  scope: ["*"],
  positions: [ExtensionPosition.DepositForm],
  __isInternal: true,
})((props) => {
  return (
    // <Suspense fallback={"loading..."}>
    <Deposit
      onOk={props.onOk}
      // @ts-ignore
      dst={{
        chainId: 0,
        address: "",
        decimals: 0,
        symbol: "",
        network: "",
      }}
    />
    // </Suspense>
  );
});

export const DepositSlot = () => {
  return <ExtensionSlot position={ExtensionPosition.DepositForm} />;
};
