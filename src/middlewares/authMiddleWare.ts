import { Request, Response, NextFunction } from "express";
import JwtUtils from "../utils/jwtUtils";

interface CustomRequest extends Request {
  userId?: string;
  email?:string;
}

const authMiddleware = (req: CustomRequest, res: Response, next: NextFunction): Response| void => {
  try{
  const token = req.header("Authorization")?.replace("Bearer ", "").trim();
  if (!token) {
    return res.status(401).json({ message: "Unauthorized. No token provided." });
  }
  const decoded = JwtUtils.verifyToken(token);
  if (!decoded || typeof decoded !== "object") {
    return res.status(403).json({ message: "Invalid token." });
  }
  const { id} = decoded as { id: string };
  if (!id) {
    return res.status(403).json({ message: "Invalid token: missing user ID." });
  }
  req.userId = id;
  next();
}catch(error){
  return res.status(500).json({ message: "Internal server error." });
}
};

export default authMiddleware;