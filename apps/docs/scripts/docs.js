// import { createDocumentation } from 'typedoc-nextra';
// import path from 'path' 
const { createDocumentation } = require('typedoc-nextra');

createDocumentation({
    // use existing typedoc json output (leave it blank to auto generate)
    jsonInputPath: `${__dirname}/../_doc_meta_/documentation.json`,
    // output location
    output: `${__dirname}/pages/types`,
    // output markdown
    markdown: true
});