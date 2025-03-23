import nodemailer from 'nodemailer';
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


export const sendResetEmail = async (email: string, token: string,role: "customer" | "carOwner") => {
  try{
  // const resetLink = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/forgotpassword/newPassword?token=${token}&role=${role}`;

  // const resetLink = `${process.env.FRONTEND_URL}/forgotpassword/newPassword?token=${token}&role=${role}`;
  const frontendUrl = process.env.FRONTEND_URL;
if (!frontendUrl) {
  console.error("FRONTEND_URL is not defined!");
  return;
}

const resetLink = `${frontendUrl}/forgotpassword/newPassword?token=${token}&role=${role}`;


  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request',
    html: `<p>You requested a password reset. Click <a href="${resetLink}">here</a> to reset your password. The link expires in 15 minutes.</p>`,
  };

  await transporter.sendMail(mailOptions);
 }catch(error){
  console.log("error sending reset otp")
 }
}

export const sendOTP = async (email: string, otp: string) => {
    try{
      
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Code for Vroom",
    text: `Your OTP code is: ${otp}. It is valid for 10 minutes.`,
  };

  await transporter.sendMail(mailOptions);
}catch(error){
    console.log("error sending mail")
}
}


