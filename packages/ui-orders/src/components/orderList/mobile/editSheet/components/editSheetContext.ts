import { createContext, useContext } from "react";
import { OrderValidationResult } from "@orderly.network/hooks";
import { OrderlyOrder } from "@orderly.network/types";
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
