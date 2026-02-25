# VaultsProvider

## Overview

Context-style provider that wires vaults page config and API: on config change sets store page config; when svApiUrl is available fetches vault list; when svApiUrl and brokerId are available fetches overall info (using overallInfoBrokerIds from config or `orderly,${brokerId}`). Renders children only (no visible UI).

## Props

Same as VaultsPageProps (PropsWithChildren): `config?`, `children`.

## Usage example

```tsx
<VaultsProvider config={{ overallInfoBrokerIds: "orderly,woofi_pro" }}>
  <VaultsHeaderWidget />
  ...
</VaultsProvider>
```
