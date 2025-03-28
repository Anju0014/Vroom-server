import { Request, Response, NextFunction } from "express";
import JwtUtils from "../utils/jwtUtils";

export interface CustomRequest extends Request {
  userId?: string;
  email?:string;
}

const authMiddleware = (req: CustomRequest, res: Response, next: NextFunction): void => {
  try{
  const token = req.header("Authorization")?.replace("Bearer ", "").trim();
  if (!token) {
    res.status(401).json({ message: "Unauthorized. No token provided." });
    return
  }
  const decoded = JwtUtils.verifyToken(token);
  if (!decoded || typeof decoded !== "object") {
     res.status(403).json({ message: "Invalid token." });
     return
  }
  const { id,email} = decoded as { id: string ;email:string};
  if (!id) {
    res.status(403).json({ message: "Invalid token: missing user ID." });
    return
  }
  req.userId = id;
  req.email=email;
  next();
}catch(error){
  res.status(500).json({ message: "Internal server error." });
  return
}
};

export default authMiddleware;

