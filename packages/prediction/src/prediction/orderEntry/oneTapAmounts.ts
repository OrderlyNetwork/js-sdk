import type { PredictionOutcome } from "../prediction.script";

export type OneTapAmounts = Record<PredictionOutcome, number[]>;

export const DEFAULT_ONE_TAP_AMOUNTS: OneTapAmounts = {
  up: [10],
  down: [10],
};
const MIN_ONE_TAP_AMOUNT = 1;
const MAX_ONE_TAP_AMOUNT = 99999.99;
const PREVIOUS_ONE_TAP_DEFAULT = [10, 50, 100];
const LEGACY_ONE_TAP_DEFAULT = [10, 100, 1000];

export const validOneTapAmounts = (amounts: unknown): amounts is number[] =>
  Array.isArray(amounts) &&
  amounts.length >= 1 &&
  amounts.length <= 3 &&
  amounts.every(
    (amount: number) =>
      Number.isFinite(amount) &&
      amount >= MIN_ONE_TAP_AMOUNT &&
      amount <= MAX_ONE_TAP_AMOUNT,
  );

const matchesOneTapPreset = (amounts: number[], preset: number[]) =>
  amounts.length === preset.length &&
  amounts.every((amount, index) => amount === preset[index]);

export const resolveOneTapAmounts = (
  stored: OneTapAmounts | number[],
  outcome: PredictionOutcome,
): number[] => {
  // Only the legacy flat-array storage ever held the factory presets; values
  // saved through the editor keep the object shape and must survive reload
  // even when they happen to match a former default.
  if (Array.isArray(stored)) {
    return validOneTapAmounts(stored) &&
      !matchesOneTapPreset(stored, PREVIOUS_ONE_TAP_DEFAULT) &&
      !matchesOneTapPreset(stored, LEGACY_ONE_TAP_DEFAULT)
      ? stored
      : DEFAULT_ONE_TAP_AMOUNTS[outcome];
  }
  return validOneTapAmounts(stored?.[outcome])
    ? stored[outcome]
    : DEFAULT_ONE_TAP_AMOUNTS[outcome];
};

export const alignOneTapAmounts = (
  up: number[],
  down: number[],
): OneTapAmounts => {
  const rowCount = Math.max(up.length, down.length);
  const fillRows = (amounts: number[], opposite: number[]) => {
    const aligned = [...amounts];
    while (aligned.length < rowCount) {
      const index = aligned.length;
      aligned.push(opposite[index] ?? aligned[index - 1] ?? 10);
    }
    return aligned;
  };
  return {
    up: fillRows(up, down),
    down: fillRows(down, up),
  };
};
