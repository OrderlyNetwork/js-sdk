import { Numeral, NumeralProps } from "@/text/numeral";
import { FC, useMemo } from "react";
import { Decimal } from "@orderly.network/utils";

export interface NumeralTotalProps extends Omit<NumeralProps, "children"> {
  price: number;
  quantity: number;
}

export const NumeralTotal: FC<NumeralTotalProps> = (props) => {
  const { rule = "price", price, quantity, ...rest } = props;

  const children = useMemo(() => {
    return new Decimal(props.price).mul(props.quantity).toNumber();
  }, [price, quantity]);

  return <Numeral {...rest}>{children}</Numeral>;
};
