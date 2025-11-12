export const ORDERLY_ICON =
  "https://oss.orderly.network/static/symbol_logo/ORDER.png";

export const ORDERLY_VAULT_TITLE = "Orderly OmniVault";

export const ORDERLY_VAULT_DESCRIPTION =
  "Earn passive yields effortlessly, no trading expertise required. OmniVault deploys market-making strategies, taking on liquidations, and accrue platform fees.";

export const getBrokerIconUrl = (brokerId: string) => {
  switch (brokerId) {
    case "orderly":
      return "https://oss.orderly.network/static/symbol_logo/ORDER.png";
    case "woofi_pro":
      return "https://oss.orderly.network/static/broker_logo/woofi_pro.png";
    case "aden":
      return "/vaults/broker/aden.png";
    case "vooi":
      return "https://oss.orderly.network/static/broker_logo/vooi.png";
    default:
      return `https://oss.orderly.network/static/broker_logo/${brokerId}.png`;
  }
};
