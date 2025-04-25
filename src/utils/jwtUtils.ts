import jwt,{JwtPayload} from 'jsonwebtoken'
import dotenv from 'dotenv'


dotenv.config()


const accessSecret=process.env.ACCESS_TOKEN_SECRET as string
const refreshSecret=process.env.REFRESH_TOKEN_SECRET as string
const resetSecret = process.env.RESET_TOKEN_SECRET as string;

class JwtUtils{
    static generateAccessToken(payload:object):string{
        return jwt.sign(payload,accessSecret,{expiresIn:'2m'})
    }

    static generateRefreshToken(payload:object):string{
        return jwt.sign(payload,refreshSecret,{expiresIn:'7d'})
    }


    static generateResetToken(payload: object): string {
        return jwt.sign(payload, resetSecret, { expiresIn: '15m' });
      }
    
      static verifyResetToken(token: string): string | jwt.JwtPayload | null {
        try {
          return jwt.verify(token, resetSecret);
        } catch (error) {
          console.error('Invalid or expired reset token');
          return null;
        }
      }

    static verifyToken(token:string,isRefreshToken=false):string|JwtPayload|null{
        try {
            const secret = isRefreshToken ? refreshSecret : accessSecret

            const decoded = jwt.verify(token,secret)
            return decoded
        } catch (error) {
            if(error instanceof jwt.TokenExpiredError){
                console.error("Token has expired");
                return {message:"Token expired"}
                
            }else if(error instanceof jwt.JsonWebTokenError){
                console.error("Invalid token signature");
                
            }
            return null
        }
    }

}


export default JwtUtils