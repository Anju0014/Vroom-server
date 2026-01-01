// import { Request, Response, NextFunction } from "express";
// import JwtUtils from "../utils/jwtUtils";

// export interface CustomRequest extends Request {
//   userId?: string;
//   email?:string;
//   role?:string
// }

// const authMiddleware = (req: CustomRequest, res: Response, next: NextFunction): void => {
//   try{
//   const token = req.header("Authorization")?.replace("Bearer ", "").trim();
//   if (!token) {
//     res.status(401).json({ message: "Unauthorized. No token provided." });
//     return
//   }
//   const decoded = JwtUtils.verifyToken(token);
//   if (!decoded || typeof decoded !== "object") {
//      res.status(403).json({ message: "Invalid token." });
//      return
//   }
//   const { id,email,role} = decoded as { id: string ;email:string,role:string};
//   if (!id) {
//     res.status(403).json({ message: "Invalid token: missing user ID." });
//     return
//   }
//   req.userId = id;
//   req.email=email;
//   req.role=role;
//   next();
// }catch(error){
//   res.status(500).json({ message: "Internal server error." });
//   return
// }
// };

// export default authMiddleware;




import { Request, Response, NextFunction } from 'express';
import JwtUtils from '../utils/jwtUtils';
import { Customer } from '../models/customer/customerModel';
import { CarOwner } from '../models/carowner/carOwnerModel';

export interface CustomRequest extends Request {
  userId?: string;
  email?: string;
  role?: 'carOwner' | 'customer' | 'admin';
}

/**
 * JWT Authentication Middleware
 */
const authMiddleware = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    console.log('Auth Header:', req.header('Authorization'));

    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Unauthorized. Token missing.' });
      return;
    }

    const token = authHeader.replace('Bearer ', '').trim();

    const decoded = JwtUtils.verifyToken(token);

    if (!decoded || typeof decoded !== 'object') {
      res.status(401).json({ message: 'Invalid token.' });
      return;
    }

    const { id, email, role } = decoded as {
      id: string;
      email: string;
      role: 'carOwner' | 'customer' | 'admin';
    };

    if (!id || !email || !role) {
      res.status(401).json({ message: 'Invalid token payload.' });
      return;
    }

    req.userId = id;
    req.email = email;
    req.role = role;

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ message: 'Token expired. Please login again.' });
      return;
    }

    res.status(401).json({ message: 'Authentication failed.' });
  }
};

/**
 * Role Authorization Middleware
 */
export const verifyRole = (
  allowedRoles: ('carOwner' | 'customer' | 'admin')[]
) => {
  return (req: CustomRequest, res: Response, next: NextFunction): void => {
    if (!req.role || !allowedRoles.includes(req.role)) {
      res.status(403).json({ message: 'Forbidden: Access denied.' });
      return;
    }
    next();
  };
};

/**
 * Blocked User Check Middleware
 */
export const checkBlocked = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId, role } = req;

    if (!userId || !role) {
      res.status(401).json({ message: 'Unauthorized request.' });
      return;
    }

    // Admins are never blocked
    if (role === 'admin') {
      next();
      return;
    }

    const user =
      role === 'customer'
        ? await Customer.findById(userId).lean()
        : await CarOwner.findById(userId).lean();

    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    if (user.blockStatus === 1) {
      res.status(403).json({
        message: 'Your account is blocked. Please contact support.',
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Blocked user check failed:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export default authMiddleware;

// import { Request, Response, NextFunction } from 'express';
// import JwtUtils from '../utils/jwtUtils';
// import { Customer } from '../models/customer/customerModel';
// import { CarOwner } from '../models/carowner/carOwnerModel';

// export interface CustomRequest extends Request {
//   userId?: string;
//   email?: string;
//   role?: 'carOwner' | 'customer' | 'admin';
// }

// const authMiddleware = (req: CustomRequest, res: Response, next: NextFunction): void => {
//   try {
//     console.log('checking auth');
//     const token = req.header('Authorization')?.replace('Bearer ', '').trim();
//     if (!token) {
//       res.status(401).json({ message: 'Unauthorized. No token provided.' });
//       return;
//     }

//     const decoded = JwtUtils.verifyToken(token);
//     if (!decoded || typeof decoded !== 'object') {
//       res.status(403).json({ message: 'Invalid token.' });
//       return;
//     }

//     const { id, email, role } = decoded as {
//       id: string;
//       email: string;
//       role: 'carOwner' | 'customer' | 'admin';
//     };

//     if (!id) {
//       res.status(403).json({ message: 'Invalid token: missing user ID.' });
//       return;
//     }

//     req.userId = id;
//     req.email = email;
//     req.role = role;
//     next();
//   } catch (error) {
//     res.status(500).json({ message: 'Internal server error.' });
//     return;
//   }
// };

// export const verifyRole = (allowedRoles: ('carOwner' | 'customer' | 'admin')[]) => {
//   return (req: CustomRequest, res: Response, next: NextFunction): void => {
//     if (!req.role || !allowedRoles.includes(req.role)) {
//       res.status(403).json({ message: 'Forbidden: Access denied.' });
//       return;
//     }
//     next();
//   };
// };

// export const checkBlocked = async (req: CustomRequest, res: Response, next: NextFunction) => {
//   try {
//     const { userId, role } = req;

//     if (!userId || !role) {
//       return res.status(401).json({ message: 'Unauthorized: Missing user data.' });
//     }

//     let user: any;
//     if (role === 'customer') {
//       user = await Customer.findById(userId);
//     } else if (role === 'carOwner') {
//       user = await CarOwner.findById(userId);
//     } else {
//       // Admins aren't blocked
//       return next();
//     }

//     if (!user) {
//       return res.status(404).json({ message: 'User not found.' });
//     }

//     if (user.blockStatus === 1) {
//       // assuming 1 = blocked, 0 = active
//       return res.status(403).json({ message: 'Your account is blocked. Contact support.' });
//     }

//     next();
//   } catch (err) {
//     console.error('Block check error:', err);
//     res.status(500).json({ message: 'Internal server error.' });
//   }
// };

// export default authMiddleware;
