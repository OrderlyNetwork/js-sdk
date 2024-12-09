#!/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const PackageJson = require("@npmcli/package-json");

const packageSrc = path.resolve(__dirname, "../packages");

const VERSION_TEMPLATE = `
declare global {
    interface Window {
        __ORDERLY_VERSION__?: {
            [key: string]: string;
        };
    }
}
if(typeof window !== 'undefined') {
    window.__ORDERLY_VERSION__ = window.__ORDERLY_VERSION__ || {};
    window.__ORDERLY_VERSION__["{{name}}"] = "{{version}}";
};

export default "{{version}}";
`;

function generateVersionFile(name, version) {
  return VERSION_TEMPLATE.replace(/{{name}}/g, name).replace(
    /{{version}}/g,
    version
  );
}

async function wirteVersionFile(path, content) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, content, (err) => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
}

async function updateCreateOrderlyPkg() {
  //=========== update create-orderly-app package.json version ===========
  const reactPakageJson = await PackageJson.load(
    path.resolve(packageSrc, "component")
  );
  const web3OnboardPakageJson = await PackageJson.load(
    path.resolve(packageSrc, "onboard")
  );
  const createOrderlyAppJson = await PackageJson.load(
    path.resolve(packageSrc, "create-orderly-app")
  );

  // wirte create-orderly-app package.json version
  createOrderlyAppJson.update({
    ...createOrderlyAppJson.content,
    orderly: {
      version: {
        "@orderly.network/react": reactPakageJson.content.version,
        "@orderly.network/web3-onboard": web3OnboardPakageJson.content.version,
      },
    },
  });

  await createOrderlyAppJson.save();

  //==========================

  // update all orderly packages version

  const packagePathMap = {
    "@orderly.network/default-evm-adapter": "default-evm-adapter",
    "@orderly.network/default-solana-adapter": "default-solana-adapter",
    "@orderly.network/web3-provider-ethers": "web3-provider-ethers",
    "@orderly.network/wallet-connector": "wallet-connector",

    "@orderly.network/core": "core",
    "@orderly.network/hooks": "hooks",
    "@orderly.network/net": "net",
    "@orderly.network/perp": "perp",
    "@orderly.network/utils": "utils",
    "@orderly.network/types": "types",
    "@orderly.network/react-app": "app",

    "@orderly.network/affiliate": "affiliate",
    "@orderly.network/trading-rewards": "trading-rewards",
    "@orderly.network/portfolio": "portfolio",
    "@orderly.network/markets": "markets",
    "@orderly.network/trading": "trading",

    "@orderly.network/ui": "ui",
    "@orderly.network/ui-connector": "ui-connector",
    "@orderly.network/ui-leverage": "ui-leverage",
    "@orderly.network/ui-orders": "ui-orders",
    "@orderly.network/ui-positions": "ui-positions",
    "@orderly.network/ui-scaffold": "ui-scaffold",
    "@orderly.network/ui-chain-selector": "ui-chain-selector",
    "@orderly.network/ui-transfer": "ui-transfer",
    "@orderly.network/ui-order-entry": "ui-order-entry",
    "@orderly.network/ui-share": "ui-share",
    "@orderly.network/ui-tpsl": "ui-tpsl",
    "@orderly.network/ui-tradingview": "ui-tradingview",
    "@orderly.network/chart": "chart",
  };

  for (const pkgName of Object.keys(packagePathMap)) {
    const pakageJson = await PackageJson.load(
      path.resolve(packageSrc, packagePathMap[pkgName])
    );
    await wirteVersionFile(
      path.resolve(packageSrc, `${packagePathMap[pkgName]}/src`, "version.ts"),
      generateVersionFile(pkgName, pakageJson.content.version)
    );
  }
}

const main = async () => {
  await updateCreateOrderlyPkg();

  // await updateOrderlyPakageVersion()
};

main();
