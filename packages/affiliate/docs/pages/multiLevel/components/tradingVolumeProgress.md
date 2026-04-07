# pages/multiLevel/components/tradingVolumeProgress.tsx

## Responsibility of TradingVolumeProgress

Shows volume prerequisite progress: current vs required volume, progress bar, and a CTA button (e.g. go to trade). Uses useReferralContext for volumePrerequisite and useScaffoldContext for routerAdapter. Used on multi-level landing or affiliate page to unlock multi-level referral.

## TradingVolumeProgress Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| classNames | { root?, description?, button? } | No | Class overrides |
| buttonProps | ButtonProps | No | Button props |

## Dependencies

- react (FC, useMemo)
- @orderly.network/i18n (useTranslation)
- @orderly.network/ui (Button, ButtonProps, cn, Flex, parseNumber, Text)
- @orderly.network/ui-scaffold (useScaffoldContext)
- @orderly.network/utils (Decimal)
- ../../../provider (useReferralContext)

## TradingVolumeProgress Example

```tsx
<TradingVolumeProgress />
```
