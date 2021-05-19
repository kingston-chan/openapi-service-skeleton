'use strict';

const {expect} = require('chai');
const fs = require('fs');
const path = require('path');
const handlebarsHelpers = require('handlebars-helpers');
const handlebarsEngineSwagger = require('../../src/openapi-code-generator/handlebars-engine-openapi');
const handlebarsHelpersSwagger = require('../../src/openapi-code-generator/handlebars-helpers-openapi');

function getDirectories(srcpath) {
  return fs.readdirSync(srcpath).filter(
    (file) => fs.statSync(path.join(srcpath, file)).isDirectory());
}

describe('Templating tests', () => {
  // openapi handlebars engine configuration  Defaults
  const configTestVales = {
    helpersDefault: handlebarsHelpers,
    helpersOpenAPI: handlebarsHelpersSwagger,
  };

  const handlebars = handlebarsEngineSwagger(configTestVales);

  for (const dir of getDirectories('./tests/openapi-code-generator/templating-tests')) {
    it(dir, () => {
      // Get test root
      const testRoot = path.join('./tests/openapi-code-generator/templating-tests', dir);

      // Compile template
      const templateContent = fs.readFileSync(path.join(testRoot, 'template.hbs'), 'utf8');
      const template = handlebars.compile(templateContent);

      // Load input
      const inputContent = fs.readFileSync(path.join(testRoot, 'input.json'), 'utf8');
      const input = JSON.parse(inputContent);

      // Load output
      const outputContent = fs.readFileSync(path.join(testRoot, 'expected.txt'), 'utf8').trim();

      // Run template
      const result = template(input).trim();
      expect(result).to.equal(outputContent);
    });
  }
});
