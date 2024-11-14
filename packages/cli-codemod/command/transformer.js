const { jscodeshift } = require("jscodeshift");
const fs = require("fs");
const path = require("path");

// const sharedDataFilePath = path.join(__dirname, "sharedData.json");

module.exports = function transformer(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  // const sharedData = getSharedData({ root, j, fileInfo });

  const OrderlyAppProviderLocalName = renamePackageImport({
    root,
    j,
    srcPkg: "@orderly.network/react",
    dstPkg: "@orderly.network/react-app",
    srcSpecifier: "OrderlyAppProvider",
    dstSpecifier: "OrderlyAppProvider",
  });

  const tradingPageLocalName = renamePackageImport({
    root,
    j,
    srcPkg: "@orderly.network/react",
    dstPkg: "@orderly.network/trading",
    srcSpecifier: "TradingPage",
    dstSpecifier: "TradingPage",
  });

  const walletConnectorProviderLocalName = renamePackageImport({
    root,
    j,
    srcPkg: "@orderly.network/web3-onboard",
    dstPkg: "@orderly.network/wallet-connector",
    srcSpecifier: "ConnectorProvider",
    dstSpecifier: "WalletConnectorProvider",
  });

  renameWalletConnectorProviderProps({
    root,
    j,
    locadlName: walletConnectorProviderLocalName,
  });

  addTradingPageProps({
    root,
    j,
    srcElementName: OrderlyAppProviderLocalName,
    dstElementName: tradingPageLocalName,
  });

  removeProps({
    root,
    j,
    locadlName: OrderlyAppProviderLocalName,
  });

  // addComment({ root, j, locadlName: OrderlyAppProviderLocalName });

  // TODO: eslint file
  return root.toSource();
};

function renamePackageImport({
  root,
  j,
  srcPkg,
  dstPkg,
  srcSpecifier,
  dstSpecifier,
}) {
  let localName;
  // find srcPkg
  const reactNode = root.find(j.ImportDeclaration, {
    source: { value: srcPkg },
  });

  reactNode.forEach((path) => {
    const specifiers = path.node.specifiers;

    const targetSpecifier = specifiers.find(
      (specifier) => specifier.imported.name === srcSpecifier
    );

    const otherSpecifiers = specifiers.filter(
      (specifier) => specifier.imported.name !== srcSpecifier
    );

    if (targetSpecifier) {
      localName = targetSpecifier.local.name;

      const isRename =
        targetSpecifier.local.name !== targetSpecifier.imported.name;

      // insertAfter dstPkg
      reactNode.insertAfter(
        j.importDeclaration(
          [
            j.importSpecifier(
              j.identifier(dstSpecifier),
              // rename import
              isRename ? j.identifier(localName) : j.identifier(dstSpecifier)
            ),
          ],
          j.literal(dstPkg)
        )
      );

      if (otherSpecifiers.length > 0) {
        // update node specifiers
        path.node.specifiers = otherSpecifiers;
      } else {
        // remove import
        j(path).remove();
      }
    }
  });

  return localName;
}

function renameWalletConnectorProviderProps({ root, j, localName }) {
  if (!localName) {
    return;
  }
  root
    .find(j.JSXElement, {
      openingElement: { name: { name: localName } },
    })
    .forEach((path) => {
      const openingElement = path.node.openingElement;
      const closingElement = path.node.closingElement;

      openingElement.name.name = localName;
      // rename components name
      if (closingElement) {
        closingElement.name.name = localName;
      }

      const optionsAttribute = openingElement.attributes.find(
        (attr) => attr.name?.name === "options"
      );

      if (optionsAttribute) {
        // options={options} -> evmInitial={{ options: options }}
        openingElement.attributes = [
          j.jsxAttribute(
            j.jsxIdentifier("evmInitial"),
            j.jsxExpressionContainer(
              j.objectExpression([
                j.property(
                  "init",
                  j.identifier("options"),
                  optionsAttribute.value.expression
                ),
              ])
            )
          ),
        ];
      }
    });
}

function addTradingPageProps({ root, j, srcElementName, dstElementName }) {
  if (!srcElementName) {
    return;
  }
  // find srcElementName
  root
    .find(j.JSXElement, {
      openingElement: { name: { name: srcElementName } },
    })
    .forEach((path) => {
      const openingElement = path.node.openingElement;

      // find shareOptions
      const shareOptionsAttr = openingElement.attributes.find(
        (attr) => attr.name && attr.name.name === "shareOptions"
      );
      // find referral
      const referralAttr = openingElement.attributes.find(
        (attr) => attr.name && attr.name.name === "referral"
      );

      const attributes = openingElement.attributes;

      // remove shareOptions and referral
      openingElement.attributes = attributes.filter(
        (attr) =>
          attr.name && !["shareOptions", "referral"].includes(attr.name.name)
      );

      if (shareOptionsAttr && !dstElementName) {
        addComment({
          j,
          attributes: openingElement.attributes,
          attribute: shareOptionsAttr,
        });
      }

      if (referralAttr && !dstElementName) {
        addComment({
          j,
          attributes: openingElement.attributes,
          attribute: referralAttr,
        });
      }

      root
        .find(j.JSXElement, {
          openingElement: { name: { name: dstElementName } },
        })
        .forEach((tradingPagePath) => {
          const tradingPageOpeningElement = tradingPagePath.node.openingElement;

          // add shareOptions={shareOptions.pnl} attributes to dstElementName
          if (shareOptionsAttr) {
            tradingPageOpeningElement.attributes.push(
              j.jsxAttribute(
                j.jsxIdentifier("shareOptions"),
                j.jsxExpressionContainer(
                  j.memberExpression(
                    shareOptionsAttr.value.expression,
                    j.identifier("pnl")
                  )
                )
              )
            );
          }

          // add referral={referral} attributes to dstElementName
          if (referralAttr) {
            tradingPageOpeningElement.attributes.push(
              j.jsxAttribute(j.jsxIdentifier("referral"), referralAttr.value)
            );
          }
        });
    });
}

function removeProps({ root, j, locadlName }) {
  if (!locadlName) {
    return;
  }
  const properties = [
    "theme",
    "topBar",
    "topBarProps",
    "footerStatusBarProps",
    "accountMenuItems",
    "onClickAccountMenuItem",
    "includeTestnet",
    // "shareOptions",
    // "referral",
    "getWalletAdapter",
  ];

  root
    .find(j.JSXElement, {
      openingElement: { name: { name: locadlName } },
    })
    .forEach((path) => {
      const openingElement = path.node.openingElement;
      // filter attributes
      openingElement.attributes = openingElement.attributes.filter(
        (attr) => !properties.includes(attr.name && attr.name.name)
      );
    });
}

function findPath({ root, j, pkg, specifier }) {
  const reactNode = root.find(j.ImportDeclaration, {
    source: { value: pkg },
  });

  let bool = false;

  reactNode.forEach((path) => {
    const spec = path.node.specifiers.find(
      (_spec) => _spec.imported.name === specifier
    );

    if (spec) {
      bool = true;
    }
  });

  return bool;
}

function addComment({ j, attribute, attributes }) {
  attributes.splice(
    attributes.length - 1,
    0,
    j.jsxText(
      `// please manually move ${attribute.name?.name} to TradingPage\n/* ${j(
        attribute
      ).toSource()} */`
    )
  );
  // const attrIndex = attributes.findIndex(
  //   (attr) => attr.name && attr.name.name === attributeName
  // );

  // if (attrIndex !== -1) {
  //   // insert
  //   attributes.splice(
  //     attributes.length - 1,
  //     0,
  //     j.jsxText(`// please manually move ${attributeName} to TradingPage`)
  //   );
  //   // comment
  //   const attribute = attributes[attrIndex + 1];
  //   attribute.comments = [j.commentBlock(` ${j(attribute).toSource()} `)];
  // }
}

function createSharedDataFile() {
  fs.writeFileSync(
    sharedDataFilePath,
    JSON.stringify({
      tradingPagePath: [],
      orderlyAppProviderPath: [],
    }),
    "utf8"
  );
}

function getSharedData({ root, j, fileInfo }) {
  // read share data
  let sharedData = JSON.parse(fs.readFileSync(sharedDataFilePath, "utf8"));

  const hasOrderlyAppProvider = findPath({
    root,
    j,
    pkg: "@orderly.network/react",
    specifier: "OrderlyAppProvider",
  });

  if (hasOrderlyAppProvider) {
    sharedData.orderlyAppProviderPath = [
      ...sharedData.orderlyAppProviderPath,
      fileInfo.path,
    ];
  }
  const hasTradingPage = findPath({
    root,
    j,
    pkg: "@orderly.network/react",
    specifier: "TradingPage",
  });
  if (hasTradingPage) {
    sharedData.tradingPagePath = [...sharedData.tradingPagePath, fileInfo.path];
  }

  sharedData.count += 1;

  // update share data
  fs.writeFileSync(sharedDataFilePath, JSON.stringify(sharedData), "utf8");

  return sharedData;
}
