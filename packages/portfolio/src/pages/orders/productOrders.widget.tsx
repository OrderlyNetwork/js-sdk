import React from "react";
import {
  useProductOrdersScript,
  type ProductOrdersProps,
} from "./productOrders.script";
import { ProductOrders } from "./productOrders.ui";

export const ProductOrdersWidget: React.FC<ProductOrdersProps> = (props) => (
  <ProductOrders {...useProductOrdersScript(props)} />
);
