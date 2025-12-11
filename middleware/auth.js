const jwt = require("jsonwebtoken");
const User = require("../models/User");
const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";

module.exports = function(allowedRoles = []) {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return res.status(401).json({ success: false, message: "Invalid token" });

      // Check role
      if (allowedRoles.length && !allowedRoles.includes(user.role)) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }

      req.user = user; // attach user to request
      next();

    } catch (err) {
      console.error(err);
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
  }
};
