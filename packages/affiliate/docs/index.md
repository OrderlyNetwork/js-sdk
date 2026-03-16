# Affiliate Package

## Overview

The `@orderly.network/affiliate` package provides the referral/affiliate UI and logic for the Orderly Network: dashboard, referral codes, commission and referees, trader rebates, and home/landing flows.

## Top-level entries

| Item | Type | Description |
|------|------|-------------|
| [src](src/index.md) | Directory | Main source: layout, provider, utils, components, pages |
| [tsup.config.ts](tsup.config.md) | Config | tsup build configuration |

## Directory structure

- **src/** – Entry (`index.ts`, `install.tsx`), version, layout, provider, utils, components, pages
- **src/layout/** – Affiliate layout (scaffold, sidebar, layout builder)
- **src/provider/** – Referral context and `ReferralProvider`
- **src/utils/** – Types, date/format helpers, SWR key generator, decimal, chart utils, mock data
- **src/components/** – Icons and small UI (affiliate, trader, edit, pin, etc.)
- **src/pages/** – home, dashboard, affiliate, trader pages and sub-routes
