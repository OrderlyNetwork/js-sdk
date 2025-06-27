import { OrderlyOrder } from "@orderly.network/types";

type Props = {
  order: OrderlyOrder;
  setOrderValue: (key: string, value: any) => void;
};

export const useTPSLAdvanced = (props: Props) => {
  const { order, setOrderValue } = props;
  return {
    order,
    setOrderValue,
  };
};
