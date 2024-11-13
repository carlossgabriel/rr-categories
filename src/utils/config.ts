import * as dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({
    path: `.env.${process.env.NODE_ENV}`,
  });
}

if (!process.env.NODE_ENV) {
  console.error('NODE_ENV must be defined');
  process.exit(1);
}

if (
  process.env.NODE_ENV !== 'production' &&
  process.env.NODE_ENV !== 'development'
) {
  console.error('NODE_ENV must be either "production" or "development"');
  process.exit(1);
}

const config = {
  // ENV
  environment: process.env.NODE_ENV || 'development',

  // SERVER CONFIG (dev)
  serverPort: process.env.SERVER_PORT
    ? parseInt(process.env.SERVER_PORT, 10)
    : 3031,
  serverHostname: process.env.SERVER_HOSTNAME || '127.0.0.1',

  MONGO_URI_SECRET_NAME:
    process.env.MONGO_URI_SECRET_NAME || 'MONGO_URI_SECRET',

  MONGODB_URL:
    process.env.MONGODB_URL ||
    'mongodb://root:semsenha@localhost:27017/?directConnection=true',
  MAX_USERS_PER_PAGE: process.env.MAX_USERS_PER_PAGE || '10',
  MONGODB_NAME: process.env.MONGODB_NAME || 'mongo_database',

  COLLECTION_NAME: process.env.COLLECTION_NAME || 'categories',
};
// console.log('config');
export default config;
