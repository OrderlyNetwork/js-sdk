# Trading Points Module

This module provides a complete points system implementation for trading campaigns, including points tracking, leaderboards, referral links, and stage management.

## Features

- 📊 **Points Dashboard**: Display user's trading points, PnL points, and referral points
- 🏆 **Leaderboard**: Show rankings with support for different time ranges (this week, last week, all time)
- 🎯 **Campaign Stages**: Support multiple campaign stages with different statuses (active, pending, completed)
- 🔗 **Referral System**: Generate and share referral links and codes
- ⏱️ **Countdown Timer**: Display countdown for pending campaigns

## Basic Usage

### Simple Integration

```tsx
import { PointSystemPage } from "@orderly.network/trading-points";

function MyApp() {
  const handleRouteChange = (option) => {
    // Handle navigation
    console.log("Navigate to:", option.href);
  };

  return <PointSystemPage onRouteChange={handleRouteChange} />;
}
```

## Advanced Usage

### Using the Points Hook

The `usePoints` hook provides access to all points-related data and methods:

```tsx
import { usePoints } from "@orderly.network/trading-points";

function CustomPointsComponent() {
  const {
    stages, // All campaign stages
    userStatistics, // User's points statistics
    currentStage, // Currently selected stage
    setCurrentStage, // Function to change stage
    isLoading, // Loading state
    isNoCampaign, // Whether there's no active campaign
    refLink, // Referral link
    refCode, // Referral code
    selectedTimeRange, // Current time range filter
    setSelectedTimeRange, // Function to change time range
    pointsDisplay, // Formatted points display data
    allTimePointsDisplay, // All-time points display data
    isCurrentStagePending, // Whether current stage is pending
    isCurrentStageCompleted, // Whether current stage is completed
    getRankingUrl, // Function to get ranking API URL
  } = usePoints();

  return (
    <div>
      <h2>Total Points: {pointsDisplay.currentPointsDisplay}</h2>
      <p>Trading Points: {pointsDisplay.tradingPointsDisplay}</p>
      <p>PnL Points: {pointsDisplay.pnlPointsDisplay}</p>
      <p>Referral Points: {pointsDisplay.referralPointsDisplay}</p>
      <p>Rank: {pointsDisplay.rankingDisplay}</p>
    </div>
  );
}
```

## Components Overview

### Main Components

- **PointSystemPage**: The main entry point component
- **Countdown**: Displays countdown timer for pending campaigns
- **Intro**: Shows campaign introduction and stage selection
- **User**: Displays user's points, stats, and referral information
- **GeneralLeaderboardWidget**: Shows the leaderboard/rankings

### Internal Structure

```
pages/points/
  ├── page.tsx           # Main page component
  ├── main.tsx           # Layout and composition
  ├── countdown.tsx      # Countdown timer
  ├── intro.tsx          # Campaign intro
  ├── user.tsx           # User stats
  └── faq.tsx            # FAQ section

components/
  ├── leaderboard/       # Leaderboard components
  └── ranking/           # Ranking components

hooks/
  └── usePointsData/     # Points data management
```
