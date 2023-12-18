const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Samochody and Wypozyczalnia API',
      version: '1.0.0',
      description: 'RAI 5.1',
    },
  },
  apis: ['src/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = {
  serveSwagger: swaggerUi.serve,
  setupSwagger: swaggerUi.setup(specs),
};