const { API_TOKEN } = require('./config');
const logger = require('./logger');

function validateBearerToken(req, res, next) {
  const authToken = req.get('Authorization');

  if (!authToken) {
    logger.error(`Unauthorized request to path: ${req.path}`);
    return res.status(401).json({ error: 'Unauthorized request' });
  }
  if (authToken.split(' ')[1] !== API_TOKEN) {
    return res.status(401).json({ error: 'Invalid key' });
  }
  // move to the next middleware
  next();
}

module.exports = validateBearerToken;
