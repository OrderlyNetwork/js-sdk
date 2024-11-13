const { jscodeshift } = require("jscodeshift");

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  renamePackageImport({
    root,
    j,
    srcPkg: "@orderly.network/react",
    dstPkg: "@orderly.network/react-app",
    srcSpecifier: "OrderlyAppProvider",
    dstSpecifier: "OrderlyAppProvider",
  });

  renamePackageImport({
    root,
    j,
    srcPkg: "@orderly.network/react",
    dstPkg: "@orderly.network/trading",
    srcSpecifier: "TradingPage",
    dstSpecifier: "TradingPage",
  });

  renamePackageImport({
    root,
    j,
    srcPkg: "@orderly.network/web3-onboard",
    dstPkg: "@orderly.network/wallet-connector",
    srcSpecifier: "ConnectorProvider",
    dstSpecifier: "WalletConnectorProvider",
  });

  renameConnectProps({
    root,
    j,
  });

  moveProps({
    root,
    j,
  });

  removeProps({
    root,
    j,
  });

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
  // find srcPkg
  const reactNode = root.find(j.ImportDeclaration, {
    source: { value: srcPkg },
  });

  reactNode.forEach((path) => {
    const specifiers = path.node.specifiers;

    const orderlyAppProviderSpecifier = specifiers.find(
      (specifier) => specifier.imported.name === srcSpecifier
    );

    const otherSpecifiers = specifiers.filter(
      (specifier) => specifier.imported.name !== srcSpecifier
    );

    if (orderlyAppProviderSpecifier) {
      // insertAfter dstPkg
      reactNode.insertAfter(
        j.importDeclaration(
          [j.importSpecifier(j.identifier(dstSpecifier))],
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
}

function renameConnectProps({ root, j }) {
  root
    .find(j.JSXElement, {
      openingElement: { name: { name: "ConnectorProvider" } },
    })
    .forEach((path) => {
      const openingElement = path.node.openingElement;
      const closingElement = path.node.closingElement;

      openingElement.name.name = "WalletConnectorProvider";
      // rename components name
      if (closingElement) {
        closingElement.name.name = "WalletConnectorProvider";
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

function removeProps({ root, j }) {
  const properties = [
    "theme",
    "topBar",
    "topBarProps",
    "footerStatusBarProps",
    "accountMenuItems",
    "onClickAccountMenuItem",
    "includeTestnet",
    "shareOptions",
    "referral",
    "getWalletAdapter",
  ];

  root
    .find(j.JSXElement, {
      openingElement: { name: { name: "OrderlyAppProvider" } },
    })
    .forEach((path) => {
      const openingElement = path.node.openingElement;
      // filter attributes
      openingElement.attributes = openingElement.attributes.filter(
        (attr) => !properties.includes(attr.name && attr.name.name)
      );
    });
}

function moveProps({ root, j }) {
  // find OrderlyAppProvider
  root
    .find(j.JSXElement, {
      openingElement: { name: { name: "OrderlyAppProvider" } },
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

      // remove shareOptions and referral
      openingElement.attributes = openingElement.attributes.filter(
        (attr) =>
          attr.name && !["shareOptions", "referral"].includes(attr.name.name)
      );

      // find TradingPage
      root
        .find(j.JSXElement, {
          openingElement: { name: { name: "TradingPage" } },
        })
        .forEach((tradingPagePath) => {
          const tradingPageOpeningElement = tradingPagePath.node.openingElement;

          // add shareOptions={shareOptions.pnl} attributes
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

          // add referral={referral} attributes
          if (referralAttr) {
            tradingPageOpeningElement.attributes.push(
              j.jsxAttribute(j.jsxIdentifier("referral"), referralAttr.value)
            );
          }
        });
    });
}
