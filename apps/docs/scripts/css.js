const postcss = require('postcss')
const postcssJs = require('postcss-js')
const path = require('path')
const fs = require('fs-extra')

const csstext = fs.readFileSync(path.resolve(__dirname, '../global.css'), 'utf8')

const root = postcss.parse(csstext);

const cssobj = postcssJs.objectify(root)

const themeFilePath = path.resolve(__dirname,'../constants', 'theme.js')


fs.ensureFileSync(themeFilePath)
fs.writeFileSync(themeFilePath, `export default ${JSON.stringify(cssobj)}`)