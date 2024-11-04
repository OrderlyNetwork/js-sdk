#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const ts = require('typescript');

function collectProps(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true);
  const props = [];

  function visit(node) {
    if (ts.isJsxOpeningElement(node) && node.tagName.getText() === 'OrderlyAppProvider') {
      node.attributes.properties.forEach(attr => {
        if (ts.isJsxAttribute(attr)) {
          const propName = attr.name.getText();
          let propValue = null;
          if (attr.initializer) {
            if (ts.isStringLiteral(attr.initializer)) {
              propValue = attr.initializer.text;
            } else if (ts.isJsxExpression(attr.initializer) && attr.initializer.expression) {
              propValue = attr.initializer.expression.getText();
            }
          }
          props.push({ key: propName, value: propValue });
        }
      });
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return props;
}

yargs(hideBin(process.argv))
  .usage('Usage: $0 [options]')
  .command('codemod', 'Scan and collect props from OrderlyAppProvider components', (yargs) => {
    yargs.option('ignore', {
      alias: 'i',
      type: 'array',
      description: 'Directories to ignore during scan',
      default: []
    });
  }, (argv) => {
    const ignorePatterns = ['node_modules/**'];
    if (argv.ignore.length > 0) {
      ignorePatterns.push(...argv.ignore);
    }

    const files = glob.sync('**/*.{ts,tsx}', { cwd: process.cwd(), ignore: ignorePatterns });
    const allProps = new Set();

    files.forEach(file => {
      const props = collectProps(path.join(process.cwd(), file));
      props.forEach(prop => allProps.add(prop));
    });

    console.log('Collected props:', Array.from(allProps));
  })
  .help('h')
  .alias('h', 'help')
  .argv;
