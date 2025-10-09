export const affiliate = {
  "affiliate.referral": "Referral",
  "affiliate.trader": "Trader",

  "affiliate.enter": "Enter",
  "affiliate.statistics": "Statistics",

  "affiliate.connectWallet.tooltip":
    "Please connect your wallet to use this function",
  "affiliate.createAccount.tooltip":
    "Create your account first to bind a referral code.",

  "affiliate.page.title":
    "Refer, earn, and grow - referral & affiliate program",
  "affiliate.page.subTitle":
    "Earn up to 60% in commissions by sharing your referral code. Invite friends, grow your network, and earn more.",
  "affiliate.page.learnMore": "Learn how it works",

  "affiliate.asAffiliate.affilates": "Affiliates",
  "affiliate.asAffiliate.title": "Referrer",
  "affiliate.asAffiliate.description":
    "Earn 10% commission from friends’ trades. Want higher commission rates? Submit an application to become an affiliate.",
  "affiliate.asAffiliate.button": "Become an affiliate",
  "affiliate.asTrader.title": "Referee (Trader)",
  "affiliate.asTrader.description":
    "Get rebates by trading with a referral code.",
  "affiliate.asTrader.button": "Enter code",

  "affiliate.referralCode": "Referral code",
  "affiliate.referralCode.dialog.title": "Bind a referral code",
  "affiliate.referralCode.dialog.description":
    "Bind a referral code to earn trading fee rebates.",
  "affiliate.referralCode.label": "Enter referral code",
  "affiliate.referralCode.bound": "Referral code bound",
  "affiliate.referralCode.notExist": "This referral code does not exist.",

  "affiliate.process.title": "How It Works",
  "affiliate.process.step1.title": "Trade $10,000+ or apply",
  "affiliate.process.step1.description":
    "Unlock a referral code automatically ($0 of $10,000 completed - main account only), or apply for a higher rate via the form.",
  "affiliate.process.step1.volumeEq0.title": "Get auto referral code or apply",
  "affiliate.process.step1.volumeEq0.description":
    "Your referral code is ready to use after placing your first trade. you can apply for a higher rate via form.",
  "affiliate.process.step1.volumeGt0.title":
    "Trade ${{requireVolume}}+ or apply",
  "affiliate.process.step1.volumeGt0.description":
    "Earn a referral code automatically (${{volume}} of ${{requireVolume}} completed), or apply for a higher rate via form.",
  "affiliate.process.step2.title": "Share",
  "affiliate.process.step2.description":
    "Share your personalized referral code with others to start earning.",
  "affiliate.process.step3.title": "Earn",
  "affiliate.process.step3.description":
    "Refer others to earn commission, or use a referral code to earn rebates on your trading",
  "affiliate.summary": "Summary",
  "affiliate.summary.refereesTraded": "Referees that traded",

  "affiliate.referralLink": "Referral link",
  "affiliate.referralLink.earn": "Earn",
  "affiliate.referralLink.earn.tooltip":
    "{{brokerName}} net fee that deduct Orderly fee.",
  "affiliate.referralLink.share": "Share",
  "affiliate.referralLink.share.tooltip":
    "Your referees get <0>{{value}}</0> of their {{brokerName}} net fee",

  "affiliate.referralVol": "Referral vol.",

  "affiliate.referralCodes": "Referral codes",
  "affiliate.referralCodes.remaining": "Remaining referral codes",
  "affiliate.referralCodes.column.you&Referee": "You / Referee",
  "affiliate.referralCodes.column.traders": "Traders",
  "affiliate.referralCodes.column.referees&Traders": "Referees / Traders",
  "affiliate.referralCodes.copyLink": "Copy link",
  "affiliate.upTo": "Up to 60%",
  "affiliate.commission": "Commission",
  "affiliate.commission.30d": "30d commission",
  "affiliate.commission.column.activeUsers": "Referral active users",

  "affiliate.myReferees": "My referees",
  "affiliate.referees": "Referees",
  "affiliate.referees.column.refereeAddress": "Referee address",
  "affiliate.referees.column.totalCommission": "Total commission",
  "affiliate.referees.column.totalVol": "Total vol.",
  "affiliate.referees.column.invitationTime": "Invitation time",

  "affiliate.trader.yourReferrer": "Your referrer",
  "affiliate.trader.rebate": "Rebate",
  "affiliate.trader.rebates": "Rebates",
  "affiliate.trader.rebate.30d": "30d trading rebates",
  "affiliate.trader.tradingRebates": "Trading rebates",
  "affiliate.trader.myRebates": "My rebates",
  "affiliate.trader.tradingVol": "Trading vol.",
  "affiliate.referralCode.editCodeModal.title": "Settings",
  "affiliate.referralCode.editCodeModal.description": "Edit your referral code",
  "affiliate.referralCode.editCodeModal.label": "Referral code",
  "affiliate.referralCode.editCodeModal.helpText.length":
    "Must be 4–10 characters long",
  "affiliate.referralCode.editCodeModal.helpText.format":
    "Only uppercase letters (A–Z) and numbers (0–9) are allowed",
  "affiliate.referralCode.editCodeModal.success":
    "Referral code updated successfully",
  "affiliate.referralRate.editRateModal.title": "Settings",
  "affiliate.referralRate.editRateModal.description":
    "Set the ratio of referral rate shared with your referees",
  "affiliate.referralRate.editRateModal.label": "Your max commission rate:",
  "affiliate.referralRate.editRateModal.label.you": "You receive",
  "affiliate.referralRate.editRateModal.label.referee": "Referee receives",
  "affiliate.referralRate.editRateModal.helpText.max":
    "The total commission rate must equal to your maximum commission rate limit",
  "affiliate.referralRate.editRateModal.success":
    "Referral rate updated successfully",
  "affiliate.referralTooltip":
    "Trade $10K to unlock your referral code and earn trading rebates from referrals.",
};

export type Affiliate = typeof affiliate;
