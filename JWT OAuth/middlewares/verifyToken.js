const jwt = require("jsonwebtoken");

// verify user token
const verifyToken = (req, res, next) => {
  try {
    const { authorization } = req.headers;
    const token = authorization?.split(" ")[1];
    const secretKey = process.env?.SECRETKEY;

    if (!token) {
      return res.status(401).json({ message: "Token is missing" });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Token is invalid" });
      }

      req.user = decoded; //store the user's payload in the req.user
      next();
    });
  } catch (error) {
    console.log("Error While Verifying Token", error);
    return res.status(500).json({ message: "Error While Verifying Token" });
  }
};

module.exports = { verifyToken };
