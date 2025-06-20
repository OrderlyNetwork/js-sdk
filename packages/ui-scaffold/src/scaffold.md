# Scaffold Component Integration Guide

## Overview

Scaffold is a powerful layout component that provides a complete application scaffolding structure, including top navigation bar, sidebar, main content area, bottom navigation, and footer. This component supports responsive layouts for both desktop and mobile devices and offers rich customization options.

## Installation and Import

```typescript
import { Scaffold, type ScaffoldProps } from "@orderly.network/ui-scaffold";
```

## Basic Usage

```typescript
import React from 'react';
import { Scaffold } from "@orderly.network/ui-scaffold";

const App = () => {
  return (
    <Scaffold>
      <div>Your main content here</div>
    </Scaffold>
  );
};
```

## ScaffoldProps Properties Detailed

### 1. leftSidebar (Optional)

- **Type**: `React.ReactNode`
- **Description**: Custom left sidebar component. If provided, the layout will use this component instead of the default sidebar component
- **Use Case**: When you need to completely customize the sidebar style and functionality

```typescript
<Scaffold
  leftSidebar={<CustomSidebar />}
>
  {children}
</Scaffold>
```

### 2. leftSideProps (Optional)

- **Type**: `SideBarProps`
- **Description**: Configuration properties for the default sidebar component
- **Main Properties**:
  - `title`: Sidebar title
  - `items`: Array of menu items
  - `open`: Whether the sidebar is expanded
  - `onOpenChange`: Callback for expansion state changes
  - `onItemSelect`: Callback for menu item selection
  - `current`: Currently selected menu item
  - `maxWidth`: Maximum width when expanded (default: 185px)
  - `minWidth`: Minimum width when collapsed (default: 98px)

```typescript
const sidebarMenus = [
  { name: "Dashboard", href: "/dashboard", icon: <DashboardIcon /> },
  { name: "Trading", href: "/trading", icon: <TradingIcon /> },
  { name: "Portfolio", href: "/portfolio", icon: <PortfolioIcon /> }
];

<Scaffold
  leftSideProps={{
    title: "Navigation",
    items: sidebarMenus,
    current: "/dashboard",
    onItemSelect: (item) => console.log('Selected:', item),
    maxWidth: 200,
    minWidth: 80
  }}
>
  {children}
</Scaffold>
```

### 3. topBar (Optional)

- **Type**: `React.ReactNode`
- **Description**: Custom top navigation bar component
- **Use Case**: When you need to completely customize the top navigation bar

```typescript
<Scaffold
  topBar={<CustomTopBar />}
>
  {children}
</Scaffold>
```

### 4. mainNavProps (Optional)

- **Type**: `MainNavWidgetProps`
- **Description**: Configuration properties for the default main navigation component
- **Main Properties**:
  - `leading`: Content on the left side of the navigation bar
  - `trailing`: Content on the right side of the navigation bar
  - `logo`: Brand logo configuration
  - `mainMenus`: Array of main menu items
  - `campaigns`: Campaign menu item
  - `campaignPosition`: Campaign menu position
  - `initialProduct`: Initial product
  - `initialMenu`: Initial menu path
  - `onItemClick`: Menu item click callback

```typescript
<Scaffold
  mainNavProps={{
    logo: {
      src: "/logo.png",
      alt: "Company Logo"
    },
    mainMenus: [
      { name: "Trade", href: "/trade" },
      { name: "Portfolio", href: "/portfolio" }
    ],
    leading: <BrandSection />,
    trailing: <UserActions />,
    onItemClick: ({ href, name }) => {
      console.log(`Navigating to ${href}`);
    }
  }}
>
  {children}
</Scaffold>
```

### 5. bottomNavProps (Optional)

- **Type**: `BottomNavProps`
- **Description**: Mobile bottom navigation configuration (only displayed on mobile devices)
- **Main Properties**:
  - `mainMenus`: Array of bottom menu items

```typescript
const bottomMenus = [
  {
    name: "Home",
    href: "/home",
    activeIcon: <HomeActiveIcon />,
    inactiveIcon: <HomeInactiveIcon />
  },
  {
    name: "Trade",
    href: "/trade",
    activeIcon: <TradeActiveIcon />,
    inactiveIcon: <TradeInactiveIcon />
  }
];

<Scaffold
  bottomNavProps={{
    mainMenus: bottomMenus,
  }}
>
  {children}
</Scaffold>
```

### 6. footer (Optional)

- **Type**: `React.ReactNode`
- **Description**: Custom footer component

```typescript
<Scaffold
  footer={<CustomFooter />}
>
  {children}
</Scaffold>
```

### 7. footerProps (Optional)

- **Type**: `FooterProps`
- **Description**: Configuration properties for the default footer component
- **Main Properties**:
  - `telegramUrl`: Telegram link
  - `twitterUrl`: Twitter link
  - `discordUrl`: Discord link
  - `trailing`: Content on the right side of the footer

```typescript
<Scaffold
  footerProps={{
    telegramUrl: "https://t.me/yourgroup",
    twitterUrl: "https://twitter.com/yourhandle",
    discordUrl: "https://discord.gg/yourserver",
    trailing: <AdditionalFooterContent />
  }}
>
  {children}
</Scaffold>
```

### 8. routerAdapter (Optional)

- **Type**: `RouterAdapter`
- **Description**: Router adapter for integrating with different routing libraries
- **Main Properties**:
  - `onRouteChange`: Route change handler function
  - `currentPath`: Current path

```typescript
// React Router integration example
const routerAdapter = {
  onRouteChange: (option) => {
    if (option.target === '_blank') {
      window.open(option.href, '_blank');
    } else {
      navigate(option.href);
    }
  },
  currentPath: location.pathname
};

<Scaffold
  routerAdapter={routerAdapter}
>
  {children}
</Scaffold>
```

### 9. classNames (Optional)

- **Type**: Style class name configuration object
- **Description**: Used to customize styles for various layout areas
- **Configurable Areas**:
  - `root`: Root container (topNavbar + container + footer)
  - `container`: Main container
  - `content`: Content area
  - `body`: Body area (leftSidebar + content)
  - `leftSidebar`: Left sidebar
  - `topNavbar`: Top navigation bar
  - `footer`: Footer

```typescript
<Scaffold
  classNames={{
    root: "custom-root-class",
    container: "custom-container-class",
    content: "custom-content-class",
    body: "custom-body-class",
    leftSidebar: "custom-sidebar-class",
    topNavbar: "custom-navbar-class",
    footer: "custom-footer-class"
  }}
>
  {children}
</Scaffold>
```

## Complete Usage Example

```typescript
import React from 'react';
import { Scaffold } from "@orderly.network/ui-scaffold";
import { useNavigate, useLocation } from 'react-router-dom';

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarMenus = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <DashboardIcon />
    },
    {
      name: "Trading",
      href: "/trading",
      icon: <TradingIcon />
    },
    {
      name: "Portfolio",
      href: "/portfolio",
      icon: <PortfolioIcon />
    }
  ];

  const bottomMenus = [
    {
      name: "Home",
      href: "/home",
      activeIcon: <HomeActiveIcon />,
      inactiveIcon: <HomeInactiveIcon />
    },
    {
      name: "Trade",
      href: "/trade",
      activeIcon: <TradeActiveIcon />,
      inactiveIcon: <TradeInactiveIcon />
    }
  ];

  const routerAdapter = {
    onRouteChange: (option) => {
      if (option.target === '_blank') {
        window.open(option.href, '_blank');
      } else {
        navigate(option.href);
      }
    },
    currentPath: location.pathname
  };

  return (
    <Scaffold
      leftSideProps={{
        title: "Navigation",
        items: sidebarMenus,
        current: location.pathname,
        onItemSelect: (item) => {
          if (item.href) {
            navigate(item.href);
          }
        }
      }}
      mainNavProps={{
        logo: {
          src: "/logo.png",
          alt: "Company Logo"
        },
        mainMenus: [
          { name: "Trade", href: "/trade" },
          { name: "Portfolio", href: "/portfolio" }
        ],
        leading: <BrandSection />,
        trailing: <UserActions />,
        onItemClick: ({ href }) => navigate(href)
      }}
      bottomNavProps={{
        mainMenus: bottomMenus,
      }}
      footerProps={{
        telegramUrl: "https://t.me/yourgroup",
        twitterUrl: "https://twitter.com/yourhandle",
        discordUrl: "https://discord.gg/yourserver"
      }}
      routerAdapter={routerAdapter}
      classNames={{
        content: "p-4",
        leftSidebar: "border-r border-gray-200"
      }}
    >
      <div className="min-h-screen">
        {/* Your main application content */}
        <h1>Welcome to your application</h1>
        <p>This is the main content area.</p>
      </div>
    </Scaffold>
  );
};

export default App;
```

## Responsive Behavior

The Scaffold component automatically detects device type and provides appropriate layouts:

- **Desktop**: Displays complete sidebar, top navigation bar, and footer
- **Mobile**: Hides sidebar, displays bottom navigation bar, optimized for touch interaction

## Best Practices

1. **Router Integration**: Always provide `routerAdapter` to ensure navigation functionality works properly
2. **Responsive Design**: Provide `bottomNavProps` configuration for mobile devices
3. **Style Customization**: Use the `classNames` property for style customization instead of directly modifying component styles
4. **Menu State Management**: Ensure the `current` property is synchronized with actual route state
5. **Performance Optimization**: For large menu lists, consider using React.memo to optimize rendering performance

## Important Notes

- The Scaffold component must be wrapped in `ScaffoldProvider` to work properly (automatically handled internally)
- Sidebar expand/collapse state is automatically saved to localStorage
- Mobile and desktop use different layout components to ensure good user experience on different devices
- All navigation callbacks should properly handle route navigation logic

## Related Components

- `ScaffoldProvider`: Provides Scaffold context
- `useScaffoldContext`: Hook to get Scaffold state
- `MobileScaffold`: Mobile layout component
- `DesktopScaffold`: Desktop layout component
