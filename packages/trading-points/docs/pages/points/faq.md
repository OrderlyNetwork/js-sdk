# faq.tsx

## Overview

FAQ section with expandable Q&A items. Questions and answers come from i18n keys (`tradingPoints.faq.*`) and optional broker name from `useConfig("brokerName")`.

## Exports

### Component

| Name | Description |
|------|-------------|
| `FAQSection` | FC that renders FAQ title and list of FAQItem. |

## Props (FAQSection)

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| className | string | No | - | Optional CSS class. |

## Internal component

- `FAQItem`: receives `question` and `answer`, toggles expand on click.

## Usage example

```tsx
import { FAQSection } from "./faq";
<FAQSection className="oui-w-full" id="points-faq" />
```
