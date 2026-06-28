type Env = "prod" | "staging" | "qa" | "dev";

export const VAULTS_API_URLS: Record<Env, string> = {
  prod: "https://api-sv.orderly.org",
  staging: "https://testnet-api-sv.orderly.org",
  qa: "https://api-sv.qa.orderly-i.network",
  dev: "https://api-sv.dev.orderly-i.network",
};

export const VAULTS_WEBSITE_URLS: Record<Env, string> = {
  prod: "https://app.orderly.network",
  staging: "https://staging-app.orderly.network",
  qa: "https://qa-app.orderly.network",
  dev: "https://dev-app.orderly.network",
};
