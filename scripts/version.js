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

  await wirteVersionFile(
    path.resolve(packageSrc, "component/src", "version.ts"),
    generateVersionFile(
      "@orderly.network/react",
      reactPakageJson.content.version
    )
  );

  await wirteVersionFile(
    path.resolve(packageSrc, "onboard/src", "version.ts"),
    generateVersionFile(
      "@orderly.network/web3-onboard",
      web3OnboardPakageJson.content.version
    )
  );

  const hooksPakageJson = await PackageJson.load(
    path.resolve(packageSrc, "hooks")
  );

  await wirteVersionFile(
    path.resolve(packageSrc, "hooks/src", "version.ts"),
    generateVersionFile(
      "@orderly.network/hooks",
      hooksPakageJson.content.version
    )
  );

  const corePakageJson = await PackageJson.load(
    path.resolve(packageSrc, "core")
  );

  await wirteVersionFile(
    path.resolve(packageSrc, "core/src", "version.ts"),
    generateVersionFile("@orderly.network/core", corePakageJson.content.version)
  );

  const perpPakageJson = await PackageJson.load(
    path.resolve(packageSrc, "perp")
  );

  await wirteVersionFile(
    path.resolve(packageSrc, "perp/src", "version.ts"),
    generateVersionFile("@orderly.network/perp", perpPakageJson.content.version)
  );

  const networkPakageJson = await PackageJson.load(
    path.resolve(packageSrc, "net")
  );

  await wirteVersionFile(
    path.resolve(packageSrc, "net/src", "version.ts"),
    generateVersionFile(
      "@orderly.network/net",
      networkPakageJson.content.version
    )
  );

  const tradingViewPakageJson = await PackageJson.load(
    path.resolve(packageSrc, "trading-view")
  );

  await wirteVersionFile(
    path.resolve(packageSrc, "trading-view/src", "version.ts"),
    generateVersionFile(
      "@orderly.network/trading-view",
      tradingViewPakageJson.content.version
    )
  );

  const typePackageJson = await PackageJson.load(
    path.resolve(packageSrc, "types")
  );

  await wirteVersionFile(
    path.resolve(packageSrc, "types/src", "version.ts"),
    generateVersionFile(
      "@orderly.network/type",
      typePackageJson.content.version
    )
  );
  const evmAdapterPackageJson = await PackageJson.load(
    path.resolve(packageSrc, "default-evm-adapter")
  );

  await wirteVersionFile(
    path.resolve(packageSrc, "default-evm-adapter/src", "version.ts"),
    generateVersionFile(
      "@orderly.network/default-evm-adapter",
      evmAdapterPackageJson.content.version
    )
  );
  const solanaAdapterPackageJson = await PackageJson.load(
    path.resolve(packageSrc, "default-solana-adapter")
  );

  await wirteVersionFile(
    path.resolve(packageSrc, "default-solana-adapter/src", "version.ts"),
    generateVersionFile(
      "@orderly.network/default-solana-adapter",
      solanaAdapterPackageJson.content.version
    )
  );
}

const main = async () => {
  await updateCreateOrderlyPkg();

  // await updateOrderlyPakageVersion()
};

main();
