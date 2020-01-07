/* eslint-disable no-undef */
// Container for all environments
const environments = {};

const sharedEnvVariables = {
  hashingSecret: process.env.MY_SECRET || 'xyz',
  httpPort: 8080,
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  bucketName: process.env.BUCKET_NAME,
  twilioMobile: process.env.TWILIO_MOBILE,
  twiliosSID: process.env.TWILIO_SSID,
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
  service: process.env.SERVICE,
  fromEmail: process.env.FROM_EMAIL,
  emailPassword: process.env.EMAIL_PASSWORD,
  awsS3BucketURL: process.env.AWS_S3_BUCKET_URL,
  awsS3BucketKeyID: process.env.AWS_S3_BUCKET_KEY_ID,
  awsS3BucketKey: process.env.AWS_S3_BUCKET_KEY,
  fcmServerKey: process.env.FCM_SERVER_KEY,
  paystackSecretKey: process.env.PAYSTACK_SECRET_KEY,
  paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY,
  db_url: process.env.DATABASE_URL,
};

// Development environment
environments.development = {
  envName: 'development',
  ...sharedEnvVariables,
};

// Production environment
environments.production = {
  envName: 'production',
  hashingSecret: process.env.MY_SECRET,
  httpPort: 8080,
  db_url: process.env.DATABASE_URL,
  ...sharedEnvVariables,
};

environments.test = {
  envName: 'test',
  ...sharedEnvVariables,
  db_url: process.env.DATABASE_TEST,
};

// Determine which environment was passed as a command-line argument
const currentEnvironment = typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the current environment is one of the environments above, if not default to staging
environmentToExport = typeof environments[currentEnvironment] === 'object'
  ? environments[currentEnvironment]
  : environments.development;

// Export the module
module.exports = environmentToExport;
