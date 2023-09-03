import { Numeral, NumeralProps } from "@/text/numeral";
import { FC, useMemo } from "react";
import { Decimal } from "@orderly.network/utils";

export interface NumeralTotalProps extends Omit<NumeralProps, "children"> {
  price: number | string;
  quantity: number | string;
}

export const NumeralTotal: FC<NumeralTotalProps> = (props) => {
  const { rule = "price", price, quantity, ...rest } = props;
  // console.log(props);

  const children = useMemo(() => {
    return new Decimal(props.price).mul(props.quantity).toNumber();
  }, [price, quantity]);

  return <Numeral {...rest}>{children}</Numeral>;
};
