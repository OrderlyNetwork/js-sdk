import { uesOrderEntryScriptReturn } from "./useOrderEntry.script";

export const OrderEntry = (props: uesOrderEntryScriptReturn) => {
  console.log("markPrice:", props.markPrice);
  return (
    <div>
      <h1>Order Entry</h1>
      <div>{props.markPrice}</div>
    </div>
  );
};
