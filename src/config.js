module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'production',
  API_TOKEN: process.env.API_TOKEN || 'dummy key',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql'
};
