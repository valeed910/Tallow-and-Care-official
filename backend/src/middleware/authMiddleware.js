import jwt from "jsonwebtoken";

export function verifyUser(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader)
    return res.status(401).json({ error: "No token provided" });

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // attach user id
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}