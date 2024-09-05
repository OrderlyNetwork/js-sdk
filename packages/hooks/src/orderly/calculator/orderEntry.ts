import { Calculator } from "../../types";

class OrderEntryCalculator implements Calculator {
  calc(markPrice: Record<string, number>) {
    console.log("!!!! Calculating positions...", markPrice);
    return [];
  }

  update(data: any) {
    console.log("!!!! Updating orderEntry...", data);
  }
}
