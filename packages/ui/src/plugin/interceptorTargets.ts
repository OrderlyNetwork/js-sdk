/**
 * Module augmentation: maps interceptor target paths to their component props types.
 * Import this file (or import from @orderly.network/ui) to enable typed props in
 * createInterceptor('Deposit.DepositForm', (Original, props, api) => ...).
 */
import type { EmptyDataStateProps } from "../table/emptyDataState";
import type { DepositFormProps } from "./plugins/deposit";

declare module "@orderly.network/plugin-core" {
  interface InterceptorTargetPropsMap {
    "Deposit.DepositForm": DepositFormProps;
    "Table.EmptyDataIdentifier": EmptyDataStateProps;
  }
}
