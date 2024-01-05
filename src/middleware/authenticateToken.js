const jwt = require("jsonwebtoken");
const secretKey = process.env.SECERATE_key; // Same key used for token signing

function authenticateToken(req, res, next) {
  const token = req.headers["authorization"];

  if (!token) {
    return res.sendStatus(401); // Unauthorized
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.sendStatus(403); // Forbidden
    }

    req.user = decoded; // Make the decoded token data available to route handlers
    next();
  });
}

module.exports = authenticateToken;
