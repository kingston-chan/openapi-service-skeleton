'use strict';

/**
 * Drop-case the first letter of a string
 * @param {object}      options       - Handlebars options.
 * @returns {string}                  - Original string with lowercased first letter.
 */
function lowercaseFirstLetter(options) {
  const string = options.fn(this);
  return string.charAt(0).toLowerCase() + string.slice(1);
}

/**
 * Extract the name of a property with a handlebars-unfriendly
 * name, such as hyphenated names. Sets the property called name
 * into context.propName if it exists and excutes the first block
 * with context value.
 *
 * Executes inverse block otherwise.
 * @param {object}      context       - Object to look in.
 * @param {string}      name          - Property name
 * @param {string}      propName      - New target property name.
 * @param {object}      options       - Handlebars options.
 * @return {string}                   - Handlebars result
 */
function propertyValueExtract(context, name, propName, options) {
  if (context[name] === undefined || context[name] === null) {
    return options.inverse(context);
  }
  this[propName] = context[name];
  /* eslint-disable no-param-reassign */
  context[propName] = context[name];
  /* eslint-enable no-param-reassign */
  return options.fn(context);
}

/**
 * Capitalize the first letter of a string
 * @param {object}      options       - Handlebars options.
 * @returns {string}                  - Original string with capitalized first letter.
 */
function uppercaseFirstLetter(options) {
  const string = options.fn(this);
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Process the primary block if the specified property has a
 * schema/$ref linkage, and the inverse block if not.
 * @param {object}      property      - Property to check
 * @param {object}      definitionMap - Definitions map
 * @param {object}      options       - Handlebars options.
 * @returns {string}                  - Handlebars output
 */
function withDefinition(property, definitionMap, options) {
  if (property !== undefined) {
    const definition = definitionMap[property];
    if (definition) {
      return options.fn(definition);
    }
  }
  return options.inverse(this);
}

function logObject(msg) {
  if (Array.isArray(msg)) {
    for(let key in msg) {
      if (Object.prototype.hasOwnProperty.call(msg, key)) {
        // eslint-disable-next-line no-console
        console.log(JSON.stringify(msg[key] /*, null, 2*/));
      }
    }
  } else {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(msg));
  }
}

/*
 * Helper that returns the first non-falsy value from the parameter list.
 * Works quite similar to the SQL's COALESCE() function, but unlike this
 * checks for the first non-false parameter.
 *
 * @example
 *     current context:
 *                        {
 *                          'application/json': { schema: { '$ref': '#/components/schemas/Address' } },
 *                          'application/xml': { schema: { '$ref': '#/components/schemas/Address' } },
 *                          'application/x-www-form-urlencoded': { schema: { '$ref': '#/components/schemas/Address' } }
 *                         }
 *     {{coalesce '*.*'  'application/json'}} => new context '{ schema: { '$ref': '#/components/schemas/Address' } }'
 *
 * @param {...any} `arguments` Variable number of arguments
 * @param {Object} `options` Handlebars options object
 * @return {String} Block, or inverse block if specified and falsey.
 */
 function coalesce(...args/* any, any, ..., options */) {
  const len = args.length - 1;
  const options = args[len];

  for (let i = 0; i < len; i += 1) {
    if (Object.prototype.hasOwnProperty.call(this, args[i])) {
      return options.fn(this[args[i]]);
    }
  }

  return options.inverse(this);
}

module.exports = {
  lowerFirst: lowercaseFirstLetter,
  property: propertyValueExtract,
  upperFirst: uppercaseFirstLetter,
  withDef: withDefinition,
  logObject,
  coalesce,           // NEW - needed for openAPI *.* or application/json
};
