import { useMemo, useSyncExternalStore } from "react";

export type FloatingDialogPosition = {
  top: number;
  left: number;
  bottom: number;
  right: number;
};

const DEFAULT_POSITION: FloatingDialogPosition = {
  top: 100,
  left: 100,
  bottom: 100,
  right: 100,
};

// Lightweight in-memory store keyed by identifier, using useSyncExternalStore for subscriptions
type Listener = () => void;

class FloatingDialogPositionStore {
  private positions = new Map<string, FloatingDialogPosition>();
  private listeners = new Set<Listener>();

  get(key: string): FloatingDialogPosition {
    return this.positions.get(key) ?? DEFAULT_POSITION;
  }

  set(key: string, position: FloatingDialogPosition) {
    this.positions.set(key, position);
    this.emit();
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit() {
    for (const listener of this.listeners) listener();
  }
}

const store = new FloatingDialogPositionStore();

/**
 * Expose the floating dialog position without persisting to disk.
 * Consumers can pass a custom key to read distinct dialog instances.
 */
export function useFloatingDialogPosition(
  key: string = "ORDERLY_FLOATING_DIALOG_POSITION",
) {
  const subscribe = useMemo(() => (cb: Listener) => store.subscribe(cb), []);
  const getSnapshot = useMemo(() => () => store.get(key), [key]);
  const position = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const setPosition = (next: FloatingDialogPosition) => store.set(key, next);

  return { position, setPosition } as const;
}
