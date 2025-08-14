import { campaignTerms } from "./terms";

export const campaignRule120 = {
  rule: [
    {
      content: "**How to participate:**",
      type: "text" as const,
      listStyle: "none" as const, // Use numbers for the 5 steps
      className: "oui-text-[20px] oui-font-semibold",
      children: [
        {
          content:
            "**Join now:** To be eligible for the campaign, kindly enable trading and click 'Join Now' to participate.",
          type: "markdown" as const,
          listStyle: "decimal" as const,
        },
        {
          content:
            "**Get your referral link**: Visit the [referral page](https://woofi.com/en/rewards/affiliate) and share your unique link/code with friends.",
          type: "markdown" as const,
          listStyle: "decimal" as const,
        },
        {
          content:
            "**Successful referrals**: Each time a new user you invite during the campaign period generates a trading volume of at least 1,000 USDC on WOOFi Pro during the campaign, it counts as a successful referral.",
          type: "markdown" as const,
          listStyle: "decimal" as const,
        },
        {
          content:
            "**Win prizes**: The top 10 users with the most successful referrals under their belts will earn rewards. A minimum number of successful referrals is required to qualify for a prize.",
          type: "markdown" as const,
          listStyle: "decimal" as const,
        },
        {
          content:
            "**Tie-breaker**: If there's a tie in referral numbers, the user whose invited friends have a higher total trading volume will rank higher.",
          type: "markdown" as const,
          listStyle: "decimal" as const,
        },
        {
          content: "**Open to all**: This event is open to everyone.",
          type: "markdown" as const,
          listStyle: "decimal" as const,
        },
      ],
    },
    {
      content: "/leaderboard/rule_120.png",
      type: "image" as const,
      listStyle: "none" as const,
      children: [
        {
          content:
            "Note: Should a user meet the qualification criteria for a rank for which all rewards have been allocated, they will automatically be assigned to the subsequent rank and will receive its designated rewards.",
          type: "markdown" as const,
          listStyle: "none" as const, // Use bullet points for bonus details
        },
      ],
    },
    {
      content: "**Welcome bonus**",
      type: "markdown" as const,
      listStyle: "none" as const, // Use bullet points for bonus details
      className: "oui-text-[20px] oui-font-semibold",
      children: [
        {
          content:
            "New users registering on WOOFi during the event with a trading volume of at least 1,000 USDC may receive a $25 USDC reward.",
          type: "text" as const,
        },
        {
          content:
            "The total prize pool is $3,750 USDC, available on a first-come, first-served basis, limited to the first 150 new users.",
          type: "text" as const,
        },
        {
          content:
            "To be eligible as a new user, you must connect your wallet to WOOFi Pro for the first time during the campaign and have no previous history of deposits or trades.",
          type: "text" as const,
        },
      ],
    },
  ],
  terms: campaignTerms,
  ruleConfig: {},
};
