# intro.tsx

## Overview

Intro section: stage title, stage dropdown selector, description, stage points/ranking card, and referral code/link card. Handles "No Active Campaigns" state.

## Exports

### Component

| Name | Description |
|------|-------------|
| `Intro` | FC, no props. Uses `usePoints()` for stage, refLink, refCode, allTimePointsDisplay. |

## Behavior

- Stage dropdown: lists stages from `usePoints().stages`, selects via `setCurrentStage`.
- Copy referral code/link with toast on success.
- "Learn more" scrolls to `#points-faq`.
- Responsive layout via `useScreen().isMobile`.

## Usage

Rendered inside Main; not typically imported directly.
