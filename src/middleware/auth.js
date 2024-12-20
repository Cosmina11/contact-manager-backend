const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
  try {
    // Log pentru debugging
    console.log("Headers received:", req.headers);

    const authHeader = req.header("Authorization");
    console.log("Auth header:", authHeader);

    if (!authHeader) {
      return res.status(401).json({
        error: "No authorization header",
        received: req.headers,
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Invalid authorization format",
        expected: "Bearer <token>",
        received: authHeader,
      });
    }

    const token = authHeader.split(" ")[1];
    console.log("Token extracted:", token);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded token:", decoded);
      req.user = decoded;
      next();
    } catch (jwtError) {
      return res.status(401).json({
        error: "Invalid token",
        details: jwtError.message,
      });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({
      error: "Server error",
      details: error.message,
    });
  }
};

module.exports = auth;
