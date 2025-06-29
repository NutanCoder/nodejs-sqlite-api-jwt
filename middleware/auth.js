const jwt = require("jsonwebtoken");
const SECRET = "your_jwt_secret";

function auth(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, SECRET, (err, user) => {
    if (err)
      return res.status(403).json({ message: "Token Expired/Invalid Token" });
    req.user = user;
    next();
  });
}

module.exports = auth;
