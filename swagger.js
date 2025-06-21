// swagger.js
const swaggerJsDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "User & Book API",
      version: "1.0.0",
      description: "Simple Node.js API with JWT, SQLite, and Swagger",
    },
    servers: [
      {
        url: "http://localhost:3000/api",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./routes/*.js"], // Points to route files
};

const swaggerSpec = swaggerJsDoc(options);

module.exports = swaggerSpec;
