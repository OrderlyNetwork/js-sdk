import { createContext, useContext } from "react";
import { OrderValidationResult } from "@kodiak-finance/orderly-hooks";
import { OrderlyOrder } from "@kodiak-finance/orderly-types";
import { SymbolContextState } from "../../../../provider/symbolContext";

export type EditSheetContextState = {
  symbolInfo: SymbolContextState;
  getErrorMsg: (
    key: keyof OrderValidationResult,
    customValue?: string,
  ) => string;
  setOrderValue: (key: keyof OrderlyOrder, value: any) => void;
};

export const EditSheetContext = createContext({} as EditSheetContextState);

export function useEditSheetContext() {
  return useContext(EditSheetContext);
}
