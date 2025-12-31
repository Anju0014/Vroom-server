import { Request, Response, NextFunction } from 'express';
import JwtUtils from '../utils/jwtUtils';
import { Customer } from '../models/customer/customerModel';
import { CarOwner } from '../models/carowner/carOwnerModel';
import { StatusCode } from '../constants/statusCode';
import logger from '../utils/logger';

export interface CustomRequest extends Request {
  userId?: string;
  email?: string;
  role?: 'carOwner' | 'customer' | 'admin';
}

const authMiddleware = (req: CustomRequest, res: Response, next: NextFunction): void => {
  try {
    console.log('checking auth');
    const token = req.header('Authorization')?.replace('Bearer ', '').trim();
    if (!token) {
      res.status(StatusCode.UNAUTHORIZED).json({ message: 'Unauthorized. No token provided.' });
      return;
    }

    const decoded = JwtUtils.verifyToken(token);
    if (!decoded || typeof decoded !== 'object') {
      res.status(StatusCode.FORBIDDEN).json({ message: 'Invalid token.' });
      return;
    }

    const { id, email, role } = decoded as {
      id: string;
      email: string;
      role: 'carOwner' | 'customer' | 'admin';
    };

    if (!id) {
      res.status(StatusCode.FORBIDDEN).json({ message: 'Invalid token: missing user ID.' });
      return;
    }

    req.userId = id;
    req.email = email;
    req.role = role;
    next();
  } catch (error) {
    logger.error(error);
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error.' });
    return;
  }
};

export const verifyRole = (allowedRoles: ('carOwner' | 'customer' | 'admin')[]) => {
  return (req: CustomRequest, res: Response, next: NextFunction): void => {
    if (!req.role || !allowedRoles.includes(req.role)) {
      res.status(StatusCode.FORBIDDEN).json({ message: 'Forbidden: Access denied.' });
      return;
    }
    next();
  };
};


export const checkBlocked = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId, role } = req;

    if (!userId || !role) {
      res
        .status(StatusCode.UNAUTHORIZED)
        .json({ message: "Unauthorized: Missing user data." });
      return;
    }

    // Admins are never blocked
    if (role === "admin") {
      next();
      return;
    }

    let user: any;

    if (role === "customer") {
      user = await Customer.findById(userId);
    } else if (role === "carOwner") {
      user = await CarOwner.findById(userId);
    }

    if (!user) {
      res
        .status(StatusCode.NOT_FOUND)
        .json({ message: "User not found." });
      return;
    }

    // 1 = blocked, 0 = active
    if (user.blockStatus === 1) {
      res
        .status(StatusCode.FORBIDDEN)
        .json({
          message: "Your account is blocked. Contact support.",
        });
      return;
    }

    next();
  } catch (err) {
    logger.error("Block check error:", err);
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error." });
  }
};



// export const checkBlocked = async (req: CustomRequest, res: Response, next: NextFunction) => {
//   try {
//     const { userId, role } = req;

//     if (!userId || !role) {
//       return res
//         .status(StatusCode.UNAUTHORIZED)
//         .json({ message: 'Unauthorized: Missing user data.' });
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
//       return res.status(StatusCode.NOT_FOUND).json({ message: 'User not found.' });
//     }

//     if (user.blockStatus === 1) {
//       // assuming 1 = blocked, 0 = active
//       return res
//         .status(StatusCode.FORBIDDEN)
//         .json({ message: 'Your account is blocked. Contact support.' });
//     }

//     next();
//   } catch (err) {
//     logger.error('Block check error:', err);
//     res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error.' });
//   }
// };

export default authMiddleware;
