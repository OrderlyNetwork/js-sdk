import { campaignTerms } from "./terms";

export const campaignRule121 = {
  rule: [
    {
      content: "**Fireant Frenzy Raffle:**",
      type: "text" as const,
      listStyle: "none" as const,
      className: "oui-text-[20px] oui-font-semibold",
    },
    {
      content:
        "Join the WOOFi Pro $1,000 USDC raffle! Earn one ticket for every $50,000 you trade—the more you trade, the better your chances. We'll draw three lucky winners from the community.",
      type: "text" as const,
      listStyle: "none" as const,
      className: "oui-font-normal oui-text-base-contrast-36",
      children: [
        {
          content: "**1st Prize: 600 USDC**",
          type: "text" as const,
          listStyle: "disc" as const,
          className: "oui-font-semibold",
        },
        {
          content: "**2nd Prize: 250 USDC**",
          type: "text" as const,
          listStyle: "disc" as const,
          className: "oui-font-semibold",
        },
        {
          content: "**3rd Prize: 150 USDC**",
          type: "text" as const,
          listStyle: "disc" as const,
          className: "oui-font-semibold",
        },
      ],
    },
    {
      content: "**Trade & Earn for New Users**",
      type: "text" as const,
      listStyle: "none" as const,
      className: "oui-text-[20px] oui-font-semibold",
      children: [
        {
          content:
            "Are you a new member of the Fireant x WOOFi community? Place your first trade on WOOFi Pro and earn a reward based on your trading volume. Check out the tiers to see what you can earn!",
          type: "text" as const,
          listStyle: "none" as const,
          className: "oui-font-normal",
        },
      ],
    },
    {
      content: "To be eligible as a new user, you must:",
      type: "text" as const,
      listStyle: "none" as const,
      className: "oui-font-bold",
      children: [
        {
          content:
            "Sign up with the Fireant referral link during the campaign.",
          type: "text" as const,
          listStyle: "disc" as const,
          className: "oui-font-normal",
        },
        {
          content: "Sign-up must be during the campaign dates.",
          type: "text" as const,
          listStyle: "disc" as const,
          className: "oui-font-normal",
        },
        {
          content: "Have no prior deposit or trading history.",
          type: "text" as const,
          listStyle: "disc" as const,
          className: "oui-font-normal",
        },
      ],
    },
    {
      content:
        "Note: Rewards are limited and will be raffled if participants exceed the number of available slots.",
      type: "text" as const,
      listStyle: "none" as const,
      className: "oui-font-normal oui-text-base-contrast-36",
      children: [
        {
          content: "/leaderboard/rule_120.png",
          type: "image" as const,
          listStyle: "none" as const,
        },
      ],
    },
  ],
  terms: campaignTerms,
  ruleConfig: {},
};
