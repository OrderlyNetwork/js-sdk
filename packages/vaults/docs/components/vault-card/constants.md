# constants (vault-card)

## Overview

Shared constants and helper for vault card: Orderly icon URL, default title/description, and broker icon URL by brokerId.

## Exports

| Name | Type | Description |
|------|------|-------------|
| ORDERLY_ICON | string | Orderly logo URL |
| ORDERLY_VAULT_TITLE | string | "Orderly OmniVault" |
| ORDERLY_VAULT_DESCRIPTION | string | Default vault description text |
| getBrokerIconUrl | (brokerId: string) => string | Returns icon URL for orderly, woofi_pro, aden, vooi, or generic broker logo |
