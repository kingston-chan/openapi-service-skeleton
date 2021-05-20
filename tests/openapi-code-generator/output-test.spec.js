'use strict';

/* eslint-disable no-console */
const dircompare = require('dir-compare');
const fs = require('fs');
const glob = require('glob');
const mkdirp = require('mkdirp');
const path = require('path');
const rimraf = require('rimraf');
const yaml = require('yamljs');
const openapicodegen = require('../../src/openapi-code-generator');
const codegen = openapicodegen.generateCode;

/**
 * This file runs output tests from ./test/output-tests. Each folder has a:
 *    openap-3.yaml  - OpenAPI 3.0.0 Service definition
 *    templates/
 *      perPath/
 *        *.hbs     - Templates to render per-path
 *      perDefinition/
 *        *.hbs     - Templates to render per-definition
 * The collective content of the files is compared to the output directory.
 */
describe('Generated Output Testing - definitions and paths', () => {

  const globbed = glob.sync('./tests/openapi-code-generator/output-tests/**/openapi-3.yaml', {});

  function deleteTempDir() {
    for (const file of globbed) {
      const parsed = path.parse(file);
      const distPath = path.join(parsed.dir, 'output');
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
    deleteTempDir();
  });

  for (const file of globbed) {
    const parsed = path.parse(file);
    const caseName = parsed.dir.split('/').slice(-1);

    const perDefTemplates = glob.sync(path.join(parsed.dir, 'templates', 'perDefinition', '*.*'));
    const perDefinition = [];
    for (const subFile of perDefTemplates) {
      const parsedChild = path.parse(subFile);
      perDefinition[subFile] = {
        target: path.join(parsed.dir, 'output', 'definitions', parsedChild.name),
        extension: parsedChild.ext,
      };
    }

    const perPathTemplates = glob.sync(path.join(parsed.dir, 'templates', 'perPath', '*.*'));
    const perPath = [];
    for (const subFile of perPathTemplates) {
      const parsedChild = path.parse(subFile);
      perPath[subFile] = {
        groupBy: 'x-exegesis-controller',
        target: path.join(parsed.dir, 'output', 'paths', parsedChild.name),
        extension: parsedChild.ext,
      };
    }

    const context = {
      openapi: yaml.load(file),
      perDefinition,
      perPath,
      output: (name, data) => {
        const parsedTarget = path.parse(name);
        mkdirp.sync(parsedTarget.dir);

        fs.writeFileSync(name, data, {
          encoding: 'utf8',
        });
      },
    };

    it(`Test Case: ${caseName} - ${caseName}`, async () => {

      function customNameCompare(name1, name2) {
        let newName1 = name1.toLowerCase();
        let newName2 = name2.toLowerCase();

        if (newName1 === newName2) {
          if (name1 !== name2) {
            console.error(`Filename case issue for = ${name1}  ${name2}`);
          }
        }
        if (name1 === name2) {
          return 0;
        }
        if (name1 > name2) {
          return 1;
        }
        return -1;
      }

      const outputFolder = path.join(parsed.dir, 'output');
      const referenceFolder = path.join(parsed.dir, 'reference');

      // await rmdir(outputFolder);
      await codegen(context);
      const result = await dircompare.compareSync(referenceFolder, outputFolder, {compareContent: true, compareNameHandler: customNameCompare,} );

      // Generate the error report
      if (!result.same) {
        console.error(`result = ${JSON.stringify(result)}`);

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

        throw new Error(JSON.stringify(fileDetails, 4, null));
      }
    });
  }
});
