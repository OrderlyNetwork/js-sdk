import { Calculator } from "../../types";
import { BaseCalculator } from "./baseCalculator";

class OrderEntryCalculator extends BaseCalculator<any> {
  calc(markPrice: Record<string, number>) {
    console.log("!!!! Calculating positions...", markPrice);
    return [];
  }

  update(data: any) {
    console.log("!!!! Updating orderEntry...", data);
  }
}
