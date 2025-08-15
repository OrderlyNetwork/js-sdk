type Env = "prod" | "staging" | "qa" | "dev";

export const VAULTS_API_URLS: Record<Env, string> = {
  prod: "https://api-sv.orderly.org",
  staging: "https://testnet-api-sv.orderly.org",
  qa: "https://qa-api-sv-aliyun.orderly.org",
  dev: "https://dev-api-sv.orderly.org",
};
