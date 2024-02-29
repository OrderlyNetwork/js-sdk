const path = require("path");
const docgen = require("react-docgen-typescript");

const options = {
  savePropValueAsString: true,
  propFilter: (prop, component) => {
    if (prop.declarations !== undefined && prop.declarations.length > 0) {
      const hasPropAdditionalDescription = prop.declarations.find((declaration) => {
        return !declaration.fileName.includes("node_modules");
      });

      return Boolean(hasPropAdditionalDescription);
    }

    return true;
  },
};

// Parse a file for docgen info
const docs = docgen.parse(path.resolve(__dirname, "../src/button/button.tsx"), options);

console.log(JSON.stringify(docs, null, 2));