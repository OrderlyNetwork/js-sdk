# Quick Start Guide: Refactored UI TradingView Package

**Version**: 1.0.0
**Date**: 2025-10-13
**Package**: @orderly.network/ui-tradingview

## Overview

The refactored UI TradingView package provides a modern, plugin-based architecture for integrating TradingView charts with Orderly Network trading functionality. This guide will help you get started quickly with the new architecture.

## Installation

```bash
# Install the main package
pnpm add @orderly.network/ui-tradingview

# Install core plugins (as needed)
pnpm add @orderly.network/ui-tradingview-plugin-order-line
pnpm add @orderly.network/ui-tradingview-plugin-position-line
pnpm add @orderly.network/ui-tradingview-plugin-tpsl
```

## Basic Usage

### 1. Simple Chart Setup

```typescript
import React from 'react';
import { TradingViewChart } from '@orderly.network/ui-tradingview';

function App() {
  return (
    <TradingViewChart
      symbol="BTC-USDT"
      interval="1D"
      theme="dark"
      width={800}
      height={600}
    />
  );
}
```

### 2. Chart with Plugins

```typescript
import React from 'react';
import {
  TradingViewChart,
  PluginRegistry,
  OrderLinePlugin,
  PositionLinePlugin,
  TPSLPlugin
} from '@orderly.network/ui-tradingview';

function TradingApp() {
  // Create plugin registry
  const pluginRegistry = new PluginRegistry();

  // Register plugins
  pluginRegistry.register(new OrderLinePlugin());
  pluginRegistry.register(new PositionLinePlugin());
  pluginRegistry.register(new TPSLPlugin());

  return (
    <TradingViewChart
      symbol="BTC-USDT"
      interval="1D"
      theme="dark"
      pluginRegistry={pluginRegistry}
      width={1200}
      height={800}
    />
  );
}
```

### 3. Advanced Configuration

```typescript
import React from 'react';
import { TradingViewChart, PluginRegistry } from '@orderly.network/ui-tradingview';
import { OrderLinePlugin } from '@orderly.network/ui-tradingview-plugin-order-line';

function AdvancedTradingApp() {
  const pluginRegistry = new PluginRegistry();

  // Configure order line plugin
  const orderLinePlugin = new OrderLinePlugin({
    showQuantity: true,
    showPnL: true,
    interactive: true,
    style: {
      lineColor: '#00ff88',
      textColor: '#ffffff',
      backgroundColor: '#1a1a1a'
    }
  });

  pluginRegistry.register(orderLinePlugin);

  const chartConfig = {
    theme: 'dark' as const,
    interval: '15M',
    studiesOverrides: {
      'volume.volume.color.0': '#00ff88',
      'volume.volume.color.1': '#ff4444'
    },
    ui: {
      showToolbar: true,
      showTimeframes: true,
      showStudies: false
    },
    externalConfig: {
      apiEndpoint: 'https://api.example.com/config',
      cacheDuration: 300
    }
  };

  return (
    <TradingViewChart
      symbol="ETH-USDT"
      config={chartConfig}
      pluginRegistry={pluginRegistry}
      onChartReady={(widget) => {
        console.log('Chart ready:', widget);
      }}
      onSymbolChange={(symbol) => {
        console.log('Symbol changed:', symbol);
      }}
      width={1200}
      height={800}
    />
  );
}
```

## Plugin Development

### Creating a Custom Plugin

```typescript
import { ChartPlugin, PluginContext } from "@orderly.network/ui-tradingview";

interface CustomIndicatorConfig {
  showLabels: boolean;
  color: string;
  period: number;
}

export class CustomIndicatorPlugin
  implements ChartPlugin<CustomIndicatorConfig>
{
  meta = {
    name: "custom-indicator",
    version: "1.0.0",
    description: "Custom technical indicator plugin",
    author: "Your Name",
  };

  private context?: PluginContext;
  private studyId?: string;

  async initialize(context: PluginContext): Promise<void> {
    this.context = context;

    // Register custom study with TradingView
    this.studyId = await context.chartWidget.createStudy(
      "CustomIndicator",
      false,
      false,
      this.getDefaultConfig().period,
      this.getDefaultConfig().color,
    );
  }

  async destroy(): Promise<void> {
    if (this.studyId) {
      this.context?.chartWidget.removeStudy(this.studyId);
    }
  }

  getDefaultConfig(): CustomIndicatorConfig {
    return {
      showLabels: true,
      color: "#ff6b6b",
      period: 14,
    };
  }

  validateConfig(config: CustomIndicatorConfig): boolean {
    return (
      typeof config.showLabels === "boolean" &&
      typeof config.color === "string" &&
      typeof config.period === "number" &&
      config.period > 0
    );
  }

  render(props: CustomIndicatorConfig): React.ReactElement {
    // Custom rendering logic (if needed)
    return React.createElement(
      "div",
      {
        style: { color: props.color },
      },
      `Custom Indicator (${props.period})`,
    );
  }

  onChartReady?(widget: IChartingLibraryWidget): void {
    // Handle chart ready event
    console.log("Custom plugin: Chart ready");
  }

  onSymbolChange?(symbol: string): void {
    // Handle symbol change event
    console.log("Custom plugin: Symbol changed to", symbol);
  }
}
```

### Registering Custom Plugin

```typescript
import { PluginRegistry } from "@orderly.network/ui-tradingview";
import { CustomIndicatorPlugin } from "./plugins/CustomIndicatorPlugin";

const pluginRegistry = new PluginRegistry();
const customPlugin = new CustomIndicatorPlugin({
  showLabels: true,
  color: "#4ecdc4",
  period: 21,
});

pluginRegistry.register(customPlugin);
```

## Configuration Management

### 1. Basic Configuration

```typescript
const basicConfig = {
  theme: "dark" as const,
  interval: "1D",
  symbol: "BTC-USDT",
  plugins: [
    {
      name: "order-line",
      version: "1.0.0",
      enabled: true,
      config: {
        showQuantity: true,
        interactive: true,
      },
    },
  ],
};
```

### 2. External Configuration Loading

```typescript
import { ConfigurationManager } from "@orderly.network/ui-tradingview";

const configManager = new ConfigurationManager({
  apiEndpoint: "https://api.example.com/charts/config",
  defaultConfig: basicConfig,
});

// Load user-specific configuration
const userConfig = await configManager.loadConfiguration(
  "user-123",
  "BTC-USDT",
);
```

### 3. Configuration Validation

```typescript
import { ConfigValidator } from '@orderly.network/ui-tradingview';

const validator = new ConfigValidator();

const isValid = validator.validate({
  theme: 'dark',
  interval: '1D',
  plugins: [...]
});

if (!isValid) {
  console.error('Configuration validation failed:', validator.errors);
}
```

## Trading Line Management

### Order Lines

```typescript
import { OrderLineManager } from "@orderly.network/ui-tradingview";

const orderLineManager = new OrderLineManager(chartWidget);

// Add order line
const orderLine = orderLineManager.addLine({
  id: "order-123",
  price: 50000,
  quantity: 0.1,
  side: "buy",
  type: "limit",
});

// Update order line
orderLineManager.updateLine("order-123", {
  price: 51000,
  quantity: 0.15,
});

// Remove order line
orderLineManager.removeLine("order-123");
```

### Position Lines

```typescript
import { PositionLineManager } from "@orderly.network/ui-tradingview";

const positionLineManager = new PositionLineManager(chartWidget);

// Add position line
const positionLine = positionLineManager.addLine({
  id: "position-456",
  side: "long",
  entryPrice: 48000,
  currentPrice: 50000,
  size: 0.5,
  unrealizedPnL: 1000,
});

// Update position line
positionLineManager.updateLine("position-456", {
  currentPrice: 52000,
  unrealizedPnL: 2000,
});
```

### TPSL Lines

```typescript
import { TPSLManager } from "@orderly.network/ui-tradingview";

const tpslManager = new TPSLManager(chartWidget);

// Add TPSL lines
const tpslLines = tpslManager.addTPSLLines({
  parentOrderId: "order-123",
  takeProfit: {
    price: 52000,
    quantity: 0.1,
  },
  stopLoss: {
    price: 47000,
    quantity: 0.1,
  },
});
```

## Event Handling

```typescript
function TradingApp() {
  const handleChartEvent = (event: ChartEvent) => {
    switch (event.type) {
      case 'orderLineClick':
        console.log('Order line clicked:', event.data);
        break;
      case 'positionLineUpdate':
        console.log('Position updated:', event.data);
        break;
      case 'tpslLineDrag':
        console.log('TPSL line dragged:', event.data);
        break;
    }
  };

  return (
    <TradingViewChart
      symbol="BTC-USDT"
      interval="1D"
      theme="dark"
      onChartEvent={handleChartEvent}
      onOrderLineClick={(orderData) => {
        // Handle order line click
        showOrderDetails(orderData);
      }}
      onPositionLineUpdate={(positionData) => {
        // Handle position update
        updatePositionUI(positionData);
      }}
    />
  );
}
```

## Performance Optimization

### 1. Lazy Plugin Loading

```typescript
import { LazyPluginManager } from "@orderly.network/ui-tradingview";

const pluginManager = new LazyPluginManager();

// Load plugins on demand
const loadOrderLinePlugin = async () => {
  const OrderLinePlugin = await import("./plugins/OrderLinePlugin");
  return new OrderLinePlugin.default();
};

const loadPositionLinePlugin = async () => {
  const PositionLinePlugin = await import("./plugins/PositionLinePlugin");
  return new PositionLinePlugin.default();
};
```

### 2. Configuration Caching

```typescript
import { CachedConfigManager } from "@orderly.network/ui-tradingview";

const configManager = new CachedConfigManager({
  cacheDuration: 300000, // 5 minutes
  maxCacheSize: 100,
});

// Cached configuration loading
const config = await configManager.getConfiguration("user-123", "BTC-USDT");
```

### 3. Bundle Optimization

```typescript
// Tree-shaking imports
import {
  ChartCore,
  type ChartConfig,
} from "@orderly.network/ui-tradingview/core";
import { OrderLinePlugin } from "@orderly.network/ui-tradingview/plugins/order-line";
import { PositionLinePlugin } from "@orderly.network/ui-tradingview/plugins/position-line";

// Only import what you need
const chart = new ChartCore();
chart.registerPlugin(OrderLinePlugin);
chart.registerPlugin(PositionLinePlugin);
```

## Migration from Legacy Version

### Legacy Code

```typescript
// Old implementation
import { TradingviewWidget } from '@orderly.network/ui-tradingview';

function OldApp() {
  return (
    <TradingviewWidget
      symbol="BTC-USDT"
      mode="trading"
      colorConfig={colorConfig}
      onFullScreenChange={handleFullScreen}
    />
  );
}
```

### Migrated Code

```typescript
// New implementation
import { TradingViewChart, PluginRegistry } from '@orderly.network/ui-tradingview';
import { OrderLinePlugin, PositionLinePlugin } from '@orderly.network/ui-tradingview/plugins';

function NewApp() {
  const pluginRegistry = new PluginRegistry();
  pluginRegistry.register(new OrderLinePlugin());
  pluginRegistry.register(new PositionLinePlugin());

  const config = {
    theme: 'dark' as const,
    interval: '1D',
    studiesOverrides: colorConfig.studiesOverrides,
    overrides: colorConfig.overrides
  };

  return (
    <TradingViewChart
      symbol="BTC-USDT"
      config={config}
      pluginRegistry={pluginRegistry}
      onFullScreenChange={handleFullScreen}
    />
  );
}
```

## Troubleshooting

### Common Issues

1. **Plugin Registration Failed**

   ```typescript
   // Check plugin dependencies
   const errors = pluginRegistry.validateDependencies();
   console.log("Dependency errors:", errors);
   ```

2. **Configuration Validation Failed**

   ```typescript
   // Validate configuration before using
   const validator = new ConfigValidator();
   const isValid = validator.validate(config);
   if (!isValid) {
     console.error("Config errors:", validator.errors);
   }
   ```

3. **Performance Issues**
   ```typescript
   // Monitor plugin performance
   pluginRegistry.on("pluginPerformance", (data) => {
     console.log(`Plugin ${data.name} took ${data.duration}ms`);
   });
   ```

### Debug Mode

```typescript
// Enable debug mode
const config = {
  ...basicConfig,
  debug: true,
  logLevel: "verbose",
};

// Plugin debugging
pluginRegistry.setDebugMode(true);
```

## Support

- **Documentation**: [Full API Documentation](https://docs.orderly.network/ui-tradingview)
- **Examples**: [GitHub Examples](https://github.com/OrderlyNetwork/ui-tradingview-examples)
- **Issues**: [GitHub Issues](https://github.com/OrderlyNetwork/ui-tradingview/issues)
- **Community**: [Discord Community](https://discord.gg/orderly)

## Next Steps

1. Explore [Plugin Development Guide](./plugin-development.md)
2. Review [API Reference](./api-reference.md)
3. Check out [Examples Repository](https://github.com/OrderlyNetwork/ui-tradingview-examples)
4. Join our [Community Discord](https://discord.gg/orderly)
