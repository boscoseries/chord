const options = {
  swaggerDefinition: {
    // Like the one described here: https://swagger.io/specification/#infoObject
    openapi: '3.0.0',
    info: {
      title: 'Maudition API specification',
      version: '1.0.0',
      description: 'Specification for Maudition Application',
      contact: {
        email: 'backstage@zonetechpark.co',
      },
      license: {
        name: 'Apache 2.0',
      },
    },
    servers: [
      {
        url: 'http://api.maudition.com/api/v1/',
        description: 'The development API server',
        variables: {
          basePath: {
            default: 'v1',
          },
        },
      },
      {
        url: 'http://35.226.14.35:8080/api/v1/',
        description: 'The development API server',
        variables: {
          port: {
            enum: ['8080', '3000'],
            default: '8080',
          },
          basePath: {
            default: 'v1',
          },
        },
      },
      {
        url: 'http://localhost:8080/api/v1',
        description: 'The development API server',
        variables: {
          port: {
            enum: ['8080', '3000'],
            default: '8080',
          },
          basePath: {
            default: 'v1',
          },
        },
      },
    ],
    tags: [
      {
        name: 'user',
        description: 'Operations about user',
      },
      {
        name: 'post',
        description: 'Operations about post',
      },
      {
        name: 'comment',
        description: 'Operations about comment',
      },
      {
        name: 'like',
        description: 'Operations about like',
      },
      {
        name: 'notification',
        description: 'Operations about notification',
      },
      {
        name: 'competition',
        description: 'Operations about competition',
      },
      {
        name: 'hashtag',
        description: 'Operations about hashtag',
      },
      {
        name: 'legal',
        description: 'Legal Information',
      },
      {
        name: 'payments',
        description: 'Operations about payments',
      },
      {
        name: 'category',
        description: 'Operations about category',
      },
    ],
  },
  // List of files to be processes. You can also set globs './app/routes/*.js'
  apis: ['./api/swagger.yaml'],
};

module.exports = options;
