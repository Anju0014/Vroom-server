// import jwt, { JwtPayload } from 'jsonwebtoken';
// import dotenv from 'dotenv';

// dotenv.config();

// const accessSecret = process.env.ACCESS_TOKEN_SECRET as string;
// const refreshSecret = process.env.REFRESH_TOKEN_SECRET as string;
// const resetSecret = process.env.RESET_TOKEN_SECRET as string;

// class JwtUtils {
//   static generateAccessToken(payload: object): string {
//     console.log('accesstoken generating point');
//     return jwt.sign(payload, accessSecret, { expiresIn: '30m' });
//   }

//   static generateRefreshToken(payload: object): string {
//     return jwt.sign(payload, refreshSecret, { expiresIn: '7d' });
//   }

//   static generateResetToken(payload: object): string {
//     return jwt.sign(payload, resetSecret, { expiresIn: '15m' });
//   }

//   static verifyResetToken(token: string): string | jwt.JwtPayload | null {
//     try {
//       return jwt.verify(token, resetSecret);
//     } catch (error) {
//       console.error('Invalid or expired reset token');
//       return null;
//     }
//   }

//   static verifyToken(token: string, isRefreshToken = false): string | JwtPayload | null {
//     try {
//       const secret = isRefreshToken ? refreshSecret : accessSecret;

//       const decoded = jwt.verify(token, secret);
//       return decoded;
//     } catch (error) {
//       if (error instanceof jwt.TokenExpiredError) {
//         console.error('Token has expired');
//         return { message: 'Token expired' };
//       } else if (error instanceof jwt.JsonWebTokenError) {
//         console.error('Invalid token signature');
//       }
//       return null;
//     }
//   }
// }

// export default JwtUtils;

import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';
import ms from 'ms';
import dotenv from 'dotenv';

dotenv.config();

/* ---------------- ENV VALIDATION ---------------- */

const requiredEnv = [
  'ACCESS_TOKEN_SECRET',
  'REFRESH_TOKEN_SECRET',
  'RESET_TOKEN_SECRET',
  'JWT_ACCESS_EXPIRES_IN',
  'JWT_REFRESH_EXPIRES_IN',
  'JWT_RESET_EXPIRES_IN',
];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Environment variable ${key} is not defined`);
  }
});

/* ---------------- SECRETS ---------------- */

const accessSecret: Secret = process.env.ACCESS_TOKEN_SECRET!;
const refreshSecret: Secret = process.env.REFRESH_TOKEN_SECRET!;
const resetSecret: Secret = process.env.RESET_TOKEN_SECRET!;

/* ---------------- OPTIONS ---------------- */

const accessOptions: SignOptions = {
  expiresIn: process.env.JWT_ACCESS_EXPIRES_IN as ms.StringValue,
};

const refreshOptions: SignOptions = {
  expiresIn: process.env.JWT_REFRESH_EXPIRES_IN as ms.StringValue,
};

const resetOptions: SignOptions = {
  expiresIn: process.env.JWT_RESET_EXPIRES_IN as ms.StringValue,
};

/* ---------------- JWT UTILS ---------------- */

class JwtUtils {
  static generateAccessToken(payload: object): string {
    return jwt.sign(payload, accessSecret, accessOptions);
  }

  static generateRefreshToken(payload: object): string {
    return jwt.sign(payload, refreshSecret, refreshOptions);
  }

  static generateResetToken(payload: object): string {
    return jwt.sign(payload, resetSecret, resetOptions);
  }

  static verifyAccessToken(token: string): JwtPayload | null {
    try {
      return jwt.verify(token, accessSecret) as JwtPayload;
    } catch {
      return null;
    }
  }

  static verifyRefreshToken(token: string): JwtPayload | null {
    try {
      return jwt.verify(token, refreshSecret) as JwtPayload;
    } catch {
      return null;
    }
  }

  static verifyResetToken(token: string): JwtPayload | null {
    try {
      return jwt.verify(token, resetSecret) as JwtPayload;
    } catch {
      return null;
    }
  }
  static verifyToken(token: string, isRefreshToken = false): JwtPayload | null {
    try {
      const secret = isRefreshToken ? refreshSecret : accessSecret;
      return jwt.verify(token, secret) as JwtPayload;
    } catch {
      return null;
    }
  }
}

export default JwtUtils;
