import { OrderEntry } from "@/block/orderEntry";

export const MyOrderEntry = () => {
  return (
    <div className="pl-1">
      <OrderEntry pair={""} available={0} />
    </div>
  );
};
