import { Input } from "@orderly.network/ui";
import { useState } from "react";

export const QuantityInput = (props: { value: number }) => {
  const [quantity] = useState(props.value);

  return <Input size="sm" value={quantity} />;
};
