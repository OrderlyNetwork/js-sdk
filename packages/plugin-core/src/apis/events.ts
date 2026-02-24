/**
 * Plugin events API - subscribable events from global EventEmitter (SimpleDI "EE").
 * Uses existing event names across the codebase for global consistency.
 */
import { EventEmitter, SimpleDI } from "@orderly.network/core";
import type { TrackerEventName } from "@orderly.network/types";

/**
 * App-level events emitted via useEventEmitter (non-TrackerEventName).
 * These are emitted directly via ee.emit() across the codebase.
 */
export const APP_EVENT_NAMES = {
  /** Order updates (execution report, create/update/cancel/fill) */
  ordersChanged: "orders:changed",
  /** Wallet/account changed (e.g. after connect/disconnect) */
  walletChanged: "wallet:changed",
  /** User requested deposit flow */
  depositRequested: "deposit:requested",
  /** User requested withdraw flow */
  withdrawRequested: "withdraw:requested",
  /** TP/SL order update for a position */
  tpslUpdateOrder: "tpsl:updateOrder",
  /** Ledger sign message error */
  walletSignMessageWithLedgerError: "wallet:sign-message-with-ledger-error",
  /** Wallet connection error */
  walletConnectError: "wallet:connect-error",
} as const;

export type AppEventName =
  (typeof APP_EVENT_NAMES)[keyof typeof APP_EVENT_NAMES];

/**
 * All events that plugins can subscribe to via api.events.on().
 * Union of TrackerEventName (useTrack) and AppEventName (ee.emit).
 */
export type PluginSubscribableEvent = TrackerEventName | AppEventName;

/**
 * Plugin events API interface.
 * Forwards to global EventEmitter (SimpleDI "EE") used by useTrack and useEventEmitter.
 */
export interface PluginEventsAPI {
  on(event: PluginSubscribableEvent, handler: (data: unknown) => void): void;
  off(event: PluginSubscribableEvent, handler: (data: unknown) => void): void;
}

/** Noop stub when EE is not yet available (e.g. before app bootstrap) */
export const NOOP_EVENTS: PluginEventsAPI = {
  on: () => {},
  off: () => {},
};

/**
 * Creates the events facade wired to the global EventEmitter (SimpleDI "EE").
 * Returns a noop stub if EE has not been initialized yet.
 */
export function createEventsFacade(): PluginEventsAPI {
  const ee = SimpleDI.get<EventEmitter>("EE");
  if (!ee) return NOOP_EVENTS;
  return {
    on: ee.on.bind(ee),
    off: ee.off.bind(ee),
  };
}
