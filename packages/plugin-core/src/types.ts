import { ElementType, ReactElement, ReactNode } from "react";
import type { PluginEventsAPI } from "./apis/events";

/* ========== New Plugin System (path-based interceptor) ========== */

/** API Facade for plugins (placeholder, extend later) */
export interface OrderlyPluginAPI {
  data?: Record<string, unknown>;
  actions?: Record<string, unknown>;
  utils?: Record<string, unknown>;
  /** Event subscription - forwards to global EventEmitter (SimpleDI "EE") */
  events: PluginEventsAPI;
}

/** Interceptor component signature: (Original, props, api) => ReactNode */
export type PluginInterceptorComponent = (
  Original: React.ComponentType<Record<string, unknown>>,
  props: Record<string, unknown>,
  api: OrderlyPluginAPI,
) => ReactNode;

/** Single interceptor targeting a component path */
export interface PluginInterceptor {
  target: string;
  component: PluginInterceptorComponent;
}

/** Plugin descriptor (per GUIDE.md) */
export interface OrderlyPlugin {
  id: string;
  name?: string;
  version?: string;
  orderlyVersion?: string;
  /** Interceptors targeting component paths (e.g. Trading.OrderEntry.SubmitButton) */
  interceptors?: PluginInterceptor[];
  setup?: (api: OrderlyPluginAPI) => void;
  onInitialize?: () => void;
  onInstall?: () => void | Promise<void>;
  onError?: (error: Error) => void;
  onFallback?: () => ReactNode | ReactElement;
}

/** SDK instance passed to plugin registration fn */
export interface OrderlySDK {
  registerPlugin: (descriptor: OrderlyPlugin) => void;
}

/** Plugin registration function: (SDK, state?) => void; calls SDK.registerPlugin internally */
export type PluginRegistrationFn<TState = unknown> = (
  SDK: OrderlySDK,
  state?: TState,
) => void;

/* ========== Legacy Extension System (position-based) ========== */

/** @deprecated Use PluginInterceptor with path-based target instead */
export type ExtensionBuilder<Props = Record<string, unknown>> = (
  props?: Partial<Props> & Record<string, unknown>,
) => Props;

/** @deprecated Use path strings (e.g. 'Deposit.DepositForm') instead */
export type ExtensionPosition = ExtensionPositionEnum | string;

/** @deprecated Use OrderlyPlugin with interceptors instead */
export interface Extension<Props extends object = object> {
  __isInternal: boolean;
  name: string;
  positions: ExtensionPosition[];
  initialize?: () => void;
  builder?: ExtensionBuilder<Props>;
  render: ElementType<Props> | ((props: Props) => ReactElement);
}

/** @deprecated Use path strings (e.g. 'Deposit.DepositForm') instead */
export enum ExtensionPositionEnum {
  DepositForm = "depositForm",
  WithdrawForm = "withdrawForm",
  AccountMenu = "accountMenu",
  MobileAccountMenu = "mobileAccountMenu",
  MainMenus = "mainMenus",
  EmptyDataIdentifier = "emptyDataIdentifier",
  /** @deprecated Use EmptyDataIdentifier - same value for backward compatibility */
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values -- intentional alias for backward compat
  EmptyDataState = "emptyDataIdentifier",
}
