# Prediction Regional Restrictions

Optional configuration for brokers that need additional Prediction restrictions.
For the required application wiring, see the
[integration guide](integration-guide.md#4-configure-feature-visibility-and-regional-restrictions).

Broker-specific Prediction region restrictions are configured through the
existing provider's `restrictedInfo` prop. The example imports
`@orderly.network/hooks`; add it as a direct dependency if missing, aligned with
the [selected SDK release](integration-guide.md#1-prepare-dependencies-and-the-host-application):

```ts
import type { RestrictedInfoOptions } from "@orderly.network/hooks";

declare const existingRestrictedInfo: RestrictedInfoOptions | undefined;
declare const extraRegions: string[];

const restrictedInfo: RestrictedInfoOptions = {
  ...existingRestrictedInfo,
  predictionRegionRestriction: {
    ...existingRestrictedInfo?.predictionRegionRestriction,
    customRestrictedRegions: [
      ...new Set([
        ...(existingRestrictedInfo?.predictionRegionRestriction
          ?.customRestrictedRegions ?? []),
        ...extraRegions,
      ]),
    ],
  },
};
```

This configuration is optional. When needed, pass
`restrictedInfo={restrictedInfo}` to the existing `OrderlyAppProvider`, keeping
its configuration form (direct props or `configStore`), other props, children,
and site-wide restriction settings unchanged. `extraRegions` contains region/city
names in the same format as the site-wide `customRestrictedRegions`. The example
merges and deduplicates the existing and extra Prediction regions while
preserving the existing `enableDefault`, including an explicit `false`.

Policy semantics:

- The policy and both fields are optional. `enableDefault` defaults to `true`,
  and `customRestrictedRegions` defaults to `[]`.
- With `enableDefault: true`, custom regions are combined with the platform
  Binary list returned by `/v1/product_restricted_areas?product_type=BINARY`.
- With `enableDefault: false`, only custom regions apply; with an empty custom
  list, no Prediction region restriction is applied.
- The policy does not override site-wide restrictions or wallet connection
  limits.
- Restricted users can still view the product, but trading is disabled. Missing
  geo data does not block trading under the current product behavior.
- For custom trading actions, use `useBinaryRegionRestricted` from
  `@orderly.network/prediction`.
