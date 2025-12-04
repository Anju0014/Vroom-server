import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { passwordResetTemplate } from '../templates/emailTemplates';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// const resetLink = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/forgotpassword/newPassword?token=${token}&role=${role}`;

// const resetLink = `${process.env.FRONTEND_URL}/forgotpassword/newPassword?token=${token}&role=${role}`;

// export const sendResetEmail = async (email: string, token: string,role: "customer" | "carOwner") => {
//   try{

//   const frontendUrl = process.env.FRONTEND_URL;
// if (!frontendUrl) {
//   console.error("FRONTEND_URL is not defined!");
//   return;
// }

// const resetLink = `${frontendUrl}/forgotpassword/newPassword?token=${token}&role=${role}`;

//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: email,
//     subject: 'Password Reset Request',
//     html: `<p>You requested a password reset. Click <a href="${resetLink}">here</a> to reset your password. The link expires in 15 minutes.</p>`,
//   };

//   await transporter.sendMail(mailOptions);
//  }catch(error){
//   console.log("error sending reset otp")
//  }
// }

// export const sendOTP = async (email: string, otp: string) => {
//     try{

//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: email,
//     subject: " Your OTP Code for Vroom",
//     text: `Your OTP code is: ${otp}. It is valid for 10 minutes.`,
//   };

//   await transporter.sendMail(mailOptions);
// }catch(error){
//     console.log("error sending mail")
// }
// }

export const sendResetEmail = async (
  email: string,
  name: string,
  token: string,
  role: 'customer' | 'carOwner'
) => {
  try {
    const frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl) {
      throw new Error('FRONTEND_URL is not defined!');
    }

    const resetLink = `${frontendUrl}/forgotpassword/newPassword?token=${token}&role=${role}`;

    const emailContent = passwordResetTemplate(name, resetLink);

    await sendEmail({
      to: email,
      ...emailContent,
    });
  } catch (error) {
    console.error('Error sending reset email:', error);
  }
};

export const sendEmail = async ({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}) => {
  try {
    console.log('sending email');
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// export const  sendTrackingEmail=async(to:string,trackingUrl:string)=>{
//   try{
//     await transporter.sendMail({
//       from:process.env.EMAIL_USER,
//       to,
//       subject:"Your Ride Starts Tomorrow",
//       text:`Hi Rider, Your Ride wil start soon. Please Share your live location: ${trackingUrl}`
//     })
//     console.log(`email send for trackingid ${to}`)
//   }
//   catch(error){
//     console.log("error sending trackingid:",error)
//   }
// }
