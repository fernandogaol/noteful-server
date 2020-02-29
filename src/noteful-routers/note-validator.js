const logger = require('../logger');

const NO_ERRORS = null;

function getNoteValidationError({ name }) {
  const duplicateName = name.filter(n => n.name === name);
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
  getNoteValidationError
};
