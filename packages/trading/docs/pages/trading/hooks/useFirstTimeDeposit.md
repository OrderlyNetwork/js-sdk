# useFirstTimeDeposit

## Overview

Returns whether the user is in a "first-time deposit" state: account allows trading (or enable-without-connected), not wrong network, not disabled, collateral total is 0, and no completed deposit in the last 90 days.

## Exports

### useFirstTimeDeposit

**Signature**: `useFirstTimeDeposit(): boolean`

Uses `useAccount`, `useAppContext`, `useCollateral`, and `useAssetsHistory` (deposits, completed, last 90 days). Returns `true` when the UI might show first-time deposit prompts.

## Usage example

Used inside `useTradingScript` to drive onboarding/first-time deposit UI.
