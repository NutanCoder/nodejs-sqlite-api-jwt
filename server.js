// server.js
const express = require("express");
const bodyParser = require("body-parser");
const swaggerUI = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

const userRoutes = require("./routes/users");
const bookRoutes = require("./routes/books");

const app = express();
app.use(bodyParser.json());

app.use("/api/users", userRoutes);
app.use("/api/books", bookRoutes);

// 🔥 Swagger route
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

const PORT = 3000;
app.listen(PORT, () =>
  console.log(
    `Server running at http://localhost:${PORT}\nSwagger docs at http://localhost:${PORT}/api-docs`
  )
);
