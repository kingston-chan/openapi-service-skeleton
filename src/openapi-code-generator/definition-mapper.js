'use strict';

const debug = require('debug')('openapi-code-generator:components-mapper');
const util = require('util');

/**
 * Map the components from a Swagger model
 * @param {object} model      - Swagger model
 * @return                    - Map of components schema name to definition body
 */
function mapComponentsFromModel(model) {
  const definitionMap = [];

  /* istanbul ignore else */
  if (model && model.components && (model.components.schemas !== undefined )) {
    // debug('Parsing %s schemas ', Object.keys(model.components.schemas.length));
    for (const definitionName of Object.keys(model.components.schemas)) {
      debug('  Reading components/schemas for %s', definitionName);
      const definitionKey = util.format('#/components/schemas/%s', definitionName);
      const currentDef = model.components.schemas[definitionName];
      currentDef.definitionName = definitionName;
      currentDef.referencePath = definitionKey;
      definitionMap[definitionKey] = currentDef;
    }
  }

  return definitionMap;
}

module.exports = mapComponentsFromModel;
