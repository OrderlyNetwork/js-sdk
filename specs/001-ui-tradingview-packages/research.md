# Research Findings: UI TradingView Package Refactoring

**Date**: 2025-10-13
**Feature**: UI TradingView Package Refactoring with Plugin Architecture

## Architecture Decisions

### 1. Plugin System Architecture

**Decision**: Enhanced Registration Pattern with Hooks and Lifecycle Management

**Rationale**:

- **Performance**: Excellent tree-shaking and minimal runtime overhead
- **Developer Experience**: Clear, explicit plugin registration with strong TypeScript support
- **TradingView Compatibility**: Works well with TradingView's adapter patterns
- **Extensibility**: Rich hook system for custom rendering and data transformation
- **Maintainability**: Centralized plugin management with dependency validation

**Alternatives Considered**:

- **Observer Pattern**: Rejected due to performance overhead and memory leak risks
- **Dynamic Loading**: Rejected due to complexity and debugging challenges

**Key Implementation**:

```typescript
interface ChartPlugin<T = any> {
  meta: {
    name: string;
    version: string;
    dependencies?: string[];
  };

  render: (props: T) => ReactElement;
  hooks?: {
    onInit?: (context: ChartContext) => void;
    onDestroy?: () => void;
    onThemeChange?: (theme: Theme) => void;
    onResize?: (size: Size) => void;
  };

  extensions?: {
    customRenderers?: Record<string, ComponentType>;
    dataTransformers?: Record<string, (data: any) => any>;
  };
}

class ChartPluginRegistry {
  register<T>(plugin: ChartPlugin<T>): void;
  unregister(name: string): void;
  getPlugin(name: string): ChartPlugin | undefined;
  executeHook(hookName: string, context: ChartContext): void;
  validateDependencies(plugin: ChartPlugin): boolean;
}
```

### 2. Configuration Management Strategy

**Decision**: Layered Configuration Approach (API-based + File-based)

**Rationale**:

- **Performance**: Base configuration available immediately, user configuration loaded lazily
- **Flexibility**: Supports both static defaults and dynamic user preferences
- **Developer Experience**: Type safety for base config, runtime validation for user config
- **TradingView Integration**: Leverages existing configuration patterns in codebase

**Layer Structure**:

1. **Base Layer (File-based)**: Core TradingView defaults, color schemes, performance-critical settings
2. **User Layer (API-based)**: Personalization, preferences, dynamic features
3. **Override Layer (Runtime)**: Temporary settings, feature flags, A/B testing

**Implementation**:

```typescript
class LayeredConfigManager {
  private baseConfig: ChartConfiguration; // File-based, immediate
  private userConfigCache = new Map<string, ChartConfiguration>(); // API-based, cached
  private runtimeConfig: Partial<ChartConfiguration> = {}; // Runtime overrides

  async getConfiguration(
    userId: string,
    symbol: string,
  ): Promise<ChartConfiguration> {
    const userConfig = await this.fetchUserConfig(userId, symbol);
    return this.mergeConfigurations(
      this.baseConfig,
      userConfig,
      this.runtimeConfig,
    );
  }

  private mergeConfigurations(
    base: any,
    user: any,
    runtime: any,
  ): ChartConfiguration {
    // Deep merge with conflict resolution
    return deepMerge(base, user, runtime);
  }
}
```

### 3. External Configuration Integration Approach

**Decision**: Runtime Configuration with Lazy Loading and Caching

**Rationale**:

- **User Experience**: Supports user-specific configurations and personalization
- **Performance**: Lazy loading with intelligent caching reduces bundle size
- **Flexibility**: Enables A/B testing and remote configuration updates
- **TradingView Compatibility**: Aligns with TradingView's dynamic configuration system

**Caching Strategy**:

```typescript
const configCache = new Map();
const cacheVersion = "1.0.0";

async function fetchConfigWithCache(configKey: string) {
  const cacheKey = `${configKey}_${cacheVersion}`;

  if (configCache.has(cacheKey)) {
    return configCache.get(cacheKey);
  }

  const config = await fetch(`/api/charts/config/${configKey}`);
  configCache.set(cacheKey, config);
  return config;
}
```

## TradingView Integration Patterns

### Current Implementation Analysis

The existing codebase demonstrates sophisticated TradingView integration:

1. **Line Adapter Integration**: Advanced use of IOrderLineAdapter and IPositionLineAdapter
2. **Drawing Tool Integration**: Complex TPSL (Take Profit/Stop Loss) service with interactive elements
3. **Configuration Management**: Hybrid approach with localStorage and API integration
4. **Service-Based Architecture**: Modular services for different chart elements

### Enhanced Integration Strategy

**Plugin-Based TradingView Integration**:

```typescript
class TradingViewPluginManager {
  private pluginRegistry: ChartPluginRegistry;
  private configManager: LayeredConfigManager;
  private chartWidget: IChartingLibraryWidget;

  async initialize(container: HTMLElement, options: ChartOptions) {
    // Load configuration
    const config = await this.configManager.getConfiguration(
      options.userId,
      options.symbol,
    );

    // Initialize TradingView widget
    this.chartWidget = new TradingView.widget({
      ...options,
      custom_indicators_getter: () => this.pluginRegistry.getCustomIndicators(),
      studies_overrides: config.studiesOverrides,
      drawings_access: config.drawingAccess,
    });

    // Register plugins
    await this.registerPlugins();

    return this.chartWidget;
  }

  private async registerPlugins() {
    // Register core plugins based on existing services
    const plugins = [
      new OrderLinePlugin(this.chartWidget),
      new PositionLinePlugin(this.chartWidget),
      new TPSLPlugin(this.chartWidget),
    ];

    plugins.forEach((plugin) => this.pluginRegistry.register(plugin));

    // Load dynamic plugins from configuration
    const config = await this.configManager.getConfiguration();
    if (config.plugins) {
      config.plugins.forEach((pluginConfig) => {
        this.loadDynamicPlugin(pluginConfig);
      });
    }
  }
}
```

## Plugin Architecture Design

### Core Plugin Types

Based on existing implementation, identify these core plugin types:

1. **Order Line Plugin**: Handles IOrderLineAdapter integration for pending orders
2. **Position Line Plugin**: Manages IPositionLineAdapter for open positions
3. **TPSL Plugin**: Complex take profit/stop loss line management with interaction
4. **Configuration Plugin**: External configuration management and theme handling
5. **Custom Renderer Plugin**: Extensibility for custom chart elements

### Plugin Interface Standardization

```typescript
interface TradingViewPlugin {
  readonly name: string;
  readonly version: string;
  readonly dependencies?: string[];

  // Lifecycle methods
  initialize(context: PluginContext): Promise<void>;
  destroy(): Promise<void>;

  // TradingView integration
  onChartReady?(widget: IChartingLibraryWidget): void;
  onSymbolChange?(symbol: string): void;
  onThemeChange?(theme: string): void;

  // Configuration
  getDefaultConfig(): PluginConfig;
  validateConfig(config: PluginConfig): boolean;

  // Rendering
  render?(props: any): ReactElement;
  update?(data: any): void;
}
```

### Plugin Loading Strategy

```typescript
class PluginLoader {
  private loadedPlugins = new Map<string, TradingViewPlugin>();

  async loadPlugin(pluginConfig: PluginConfig): Promise<TradingViewPlugin> {
    const pluginKey = `${pluginConfig.name}@${pluginConfig.version}`;

    if (this.loadedPlugins.has(pluginKey)) {
      return this.loadedPlugins.get(pluginKey)!;
    }

    // Load plugin module
    const pluginModule = await import(`./plugins/${pluginConfig.name}`);
    const PluginClass = pluginModule.default;

    // Validate and instantiate
    const plugin = new PluginClass();
    if (plugin.validateConfig(pluginConfig.config)) {
      await plugin.initialize(this.createPluginContext(pluginConfig));
      this.loadedPlugins.set(pluginKey, plugin);
    }

    return plugin;
  }
}
```

## Performance Optimization

### Bundle Size Reduction

**Current Issues**:

- 34,440 lines of code in ui-tradingview package
- 9 internal dependencies creating tight coupling
- Large TypeScript declaration files

**Optimization Strategy**:

```typescript
// Plugin-based imports enable tree-shaking
import { ChartCore } from "@orderly.network/ui-tradingview/core";
import { OrderLinePlugin } from "@orderly.network/ui-tradingview/plugins/order-line";
import { PositionLinePlugin } from "@orderly.network/ui-tradingview/plugins/position-line";

// Developers only import what they need
const chart = new ChartCore();
chart.registerPlugin(OrderLinePlugin);
chart.registerPlugin(PositionLinePlugin);
```

### Runtime Performance

**Goals**:

- <100ms plugin registration time
- <200ms line rendering for 100+ concurrent trading lines
- <100ms configuration loading with caching

**Optimization Techniques**:

```typescript
// Lazy plugin loading
class LazyPluginManager {
  private pluginPromises = new Map<string, Promise<TradingViewPlugin>>();

  async getPlugin(name: string): Promise<TradingViewPlugin> {
    if (!this.pluginPromises.has(name)) {
      this.pluginPromises.set(name, this.loadPlugin(name));
    }
    return this.pluginPromises.get(name)!;
  }

  private async loadPlugin(name: string): Promise<TradingViewPlugin> {
    const module = await import(`./plugins/${name}`);
    return new module.default();
  }
}

// Efficient line rendering with object pooling
class LineRenderer {
  private linePool: IOrderLineAdapter[] = [];

  renderLine(order: OrderData): IOrderLineAdapter {
    const line = this.linePool.pop() || this.chart.createOrderLine();
    line.setPrice(order.price);
    line.setQuantity(order.quantity);
    return line;
  }

  releaseLine(line: IOrderLineAdapter): void {
    line.remove();
    this.linePool.push(line);
  }
}
```

## Configuration Schema

### Plugin Configuration Schema

```typescript
interface PluginConfig {
  name: string;
  version: string;
  enabled: boolean;
  config: Record<string, any>;
  dependencies?: string[];
}

interface ChartConfiguration {
  // Core TradingView settings
  theme: "light" | "dark";
  interval: string;
  symbol: string;

  // Plugin configuration
  plugins: PluginConfig[];

  // Styling overrides
  studiesOverrides: Record<string, any>;
  overrides: Record<string, any>;

  // External configuration
  externalConfig?: {
    apiEndpoint?: string;
    configVersion?: string;
    cacheDuration?: number;
  };
}
```

### Configuration Validation

```typescript
const chartConfigSchema = {
  type: "object",
  properties: {
    theme: { type: "string", enum: ["light", "dark"] },
    interval: { type: "string", pattern: "^[0-9]+[A-Z]$" },
    plugins: {
      type: "array",
      items: { $ref: "#/definitions/pluginConfig" },
    },
  },
  required: ["theme", "interval"],
};

function validateChartConfiguration(config: any): boolean {
  const ajv = new Ajv();
  const validate = ajv.compile(chartConfigSchema);
  return validate(config);
}
```

## Migration Strategy

### Backward Compatibility

**Breaking Changes Identified**:

- Major architectural shift from monolithic to plugin-based
- Configuration management changes
- API surface modifications

**Migration Approach**:

```typescript
// Legacy compatibility wrapper
export class LegacyTradingViewWidget {
  private pluginManager: TradingViewPluginManager;

  constructor(props: LegacyTradingViewProps) {
    // Convert legacy props to new plugin configuration
    const config = this.convertLegacyConfig(props);
    this.pluginManager = new TradingViewPluginManager(config);
  }

  private convertLegacyConfig(
    props: LegacyTradingViewProps,
  ): ChartConfiguration {
    return {
      theme: props.theme || "dark",
      interval: props.interval || "1D",
      plugins: [
        {
          name: "order-line",
          version: "1.0.0",
          enabled: props.showOrderLines !== false,
          config: { ...props.orderLineConfig },
        },
        {
          name: "position-line",
          version: "1.0.0",
          enabled: props.showPositionLines !== false,
          config: { ...props.positionLineConfig },
        },
      ],
    };
  }
}
```

### Versioning Strategy

**Semantic Versioning**:

- **Major (X.0.0)**: Breaking changes to plugin architecture
- **Minor (0.X.0)**: New plugin types or configuration options
- **Patch (0.0.X)**: Bug fixes and performance improvements

**Configuration Versioning**:

```typescript
interface ConfigurationVersion {
  version: string;
  migration?: (oldConfig: any) => any;
  deprecated?: boolean;
}

const configMigrations: ConfigurationVersion[] = [
  {
    version: "1.0.0",
    migration: (oldConfig) => ({
      ...oldConfig,
      plugins: convertLegacyPlugins(oldConfig),
    }),
  },
];
```

## Summary

The research establishes a clear direction for the TradingView package refactoring:

1. **Plugin Architecture**: Enhanced registration pattern with TypeScript support and lifecycle management
2. **Configuration Management**: Layered approach combining file-based defaults with API-based user configuration
3. **TradingView Integration**: Leverage existing advanced patterns while simplifying through plugin abstraction
4. **Performance**: Significant bundle size reduction and runtime performance improvements
5. **Developer Experience**: Simplified API with comprehensive plugin ecosystem
6. **Backward Compatibility**: Migration strategy to support existing integrations

This approach addresses all constitutional requirements while providing a foundation for future extensibility and improved developer experience.
