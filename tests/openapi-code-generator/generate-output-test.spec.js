'use strict';

const defaults = require('defaults-deep');
const fs = require('fs');
const glob = require('glob');
const mkdirp = require('mkdirp');
const path = require('path');
const yaml = require('yamljs');
// const dircompare = require('dir-compare');
const rimraf = require('rimraf');
const openapicodegen = require('../../src/openapi-code-generator');
const codegen = openapicodegen.generateCode;
const templates = openapicodegen.oas3_templates;

/**
 * This file generates output service from the ./test/generate-output-tests/ directories.
 *   Each folder has a:
 *    <name>/*oas3.yaml   - OpenAPI 3.0.0 Service definition
 *    <name>/dist         - Will contain the output gerated service js files
 */
describe('Generated Output Testing - Controllers', () => {
  const globbed = glob.sync('./tests/openapi-code-generator/generate-output-tests/**/*oas3.yaml ', {});

  function deleteTempDir() {
    for (const file of globbed) {
      const parsed = path.parse(file);
      const distPath = path.join(parsed.dir, 'dist');
      rimraf(distPath, (er) => {
        if (er)
        {
          throw er;
        }
      });
    }
  }

  before(() => {
    deleteTempDir();
  });

  after(() => {
    //deleteTempDir();
  });

  for (const file of globbed) {
    const parsed = path.parse(file);
    const caseName = parsed.dir.split('/').slice(-1);

    const codegenTemplateSettings = {
      implementationPath: path.join(parsed.dir, 'dist', 'controllers')
    };

    // Build up the execution parameters for the templates.
    const context = defaults(
      templates(codegenTemplateSettings),
      {
        openapi: yaml.load(file),
        output: (name, content) => {
          const fullName = path.join(parsed.dir, 'dist', name);
          const parsedFN = path.parse(fullName);
          mkdirp.sync(parsedFN.dir);
          fs.writeFileSync(fullName, content, { encoding: 'utf8'});
        }
      }
    );

    it(`Test Case: ${caseName}`, () => {
      return codegen(context);
    });
  }

  /*
      const outputFolder = path.join(parsed.dir, 'output');
      const referenceFolder = path.join(parsed.dir, 'reference');
      rimraf.sync(outputFolder);
      codegen(context);
      const result = dircompare.compareSync(referenceFolder, outputFolder, {
        compareContent: true,
      });

      // Generate the error report
      if (!result.same) {
        const fileDetails = [];
        result.diffSet.forEach((item) => {
          // Difference type
          const state = {
            equal: '==',
            left: 'Missing from output',
            right: 'Extra output file',
            distinct: 'Content difference',
          }[item.state];

          // Log item
          if (state !== '==') {
            fileDetails.push({
              left: {
                type: item.type1 || '',
                name: item.name1 || '',
              },
              right: {
                type: item.type2 || '',
                name: item.name2 || '',
              },
              state,
            });
          }
        });

        throw new Error(JSON.stringify(fileDetails, 4));
      }
*/
});
