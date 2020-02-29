const logger = require('../logger');

const NO_ERRORS = null;

function getFolderValidationError({ name }) {
  if (name.length < 2 || name.length > 15) {
    logger.error(`Invalid name '${name}' supplied`);
    return {
      error: {
        message: `'name' must be a string between 2 and 15 characters`
      }
    };
  }

  return NO_ERRORS;
}

module.exports = {
  getFolderValidationError
};
