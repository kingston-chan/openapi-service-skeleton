'use strict';

const debug = require('debug')('openapi-code-generator:handlebarsEngine');
const hbs = require('handlebars');

/**
 * The handlebarsEngine loads a new instance of handlebars and applies
 * the task-specific helper functions
 */
function handlebarsEngine(taskOptions) {
  debug('Initializing new instance of hbs');
  const handlebars = hbs.create();

  /* istanbul ignore else */
  if (taskOptions.helpersDefault) {
    taskOptions.helpersDefault({handlebars});
  }

  /* istanbul ignore else */
  if (taskOptions.helpersOpenAPI) {
    for (const helper of Object.keys(taskOptions.helpersOpenAPI)) {
      if(!(helper in handlebars.helpers)) {
//        debug('  Registering openapi helper: %s', helper);
        handlebars.registerHelper(helper, taskOptions.helpersOpenAPI[helper]);
      } else {
        debug('  handlebars openapi helper: %s allready registered!', helper);
      }
    }
  }

  return handlebars;
}

module.exports = handlebarsEngine;
