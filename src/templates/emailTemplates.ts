export const verificationRejectedTemplate = (name: string, reason: string | undefined) => ({
  subject: '❌ Vroom Verification Rejected',
  text: `Dear ${name},

Thank you for submitting your verification details. Unfortunately, your verification request has been rejected for the following reason:

👉 ${reason}

Please review the above issue, make the necessary corrections, and reapply for verification.

If you need assistance, feel free to contact our support team.

Best regards,  
The Vroom Support Team 🚗`,

  html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color:#d9534f;">❌ Verification Rejected</h2>
      <p>Dear ${name},</p>
      <p>Unfortunately, your request has been <strong style="color:#d9534f;">rejected</strong> for the following reason:</p>
      <blockquote style="background:#f8d7da; padding:10px; border-left:4px solid #d9534f; margin:10px 0;">
        ${reason}
      </blockquote>
      <p>Please review the issue and reapply. If you need help, contact our support team.</p>
      <p style="margin-top:30px;">Best regards,<br/><strong>The Vroom Team 🚗</strong></p>
    </div>
  `,
});

export const verificationApprovedTemplate = (name: string) => ({
  subject: '✅ Vroom Verification Approved',
  text: `Dear ${name},

Good news! 🎉 Your Vroom verification has been successfully approved.  

You can now log in to your account and start adding your car listings for rental.

We’re excited to have you onboard and look forward to seeing your cars listed on Vroom!

Best regards,  
The Vroom Support Team 🚗`,

  html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color:#28a745;">✅ Verification Approved</h2>
      <p>Dear ${name},</p>
      <p>Good news! 🎉 Your <strong>Vroom verification</strong> has been successfully approved.</p>
      <p>You can now log in to your account and start adding your car listings for rental.</p>
      <p>We’re excited to have you onboard and look forward to seeing your cars listed on Vroom!</p>
      <p style="margin-top:30px;">Best regards,<br/><strong>The Vroom Team 🚗</strong></p>
    </div>
  `,
});

export const otpTemplate = (otp: string) => ({
  subject: '🔑 Your Vroom Verification Code (Valid for 10 Minutes)',
  text: `Hello,

We received a request to verify your identity on Vroom. 
Here is your One-Time Password (OTP):

👉 ${otp}

This code is valid for the next 10 minutes. Please do not share this code with anyone for security reasons.

If you did not request this verification, you can safely ignore this email.

Thanks,  
The Vroom Team`,
  html: `
    <div style="font-family: Arial, sans-serif; line-height:1.6; color:#333;">
      <h2 style="color:#007BFF;">Vroom Verification Code</h2>
      <p>Hello,</p>
      <p>We received a request to verify your identity on <strong>Vroom</strong>.</p>
      <p>Your One-Time Password (OTP) is:</p>
      <h3 style="background:#f1f1f1; padding:10px; text-align:center;">${otp}</h3>
      <p>This code is valid for the next 10 minutes. Do not share it with anyone.</p>
      <p>If you did not request this verification, ignore this email.</p>
      <p>Thanks,<br/>The Vroom Team 🚗</p>
    </div>
  `,
});

export const trackingEmailTemplate = (trackingUrl: string) => ({
  subject: '🚗 Your Vroom Ride Starts Tomorrow – Share Your Live Location',
  text: `Hello,

Your scheduled ride with Vroom is starting tomorrow! 🎉  

To ensure a smooth and safe trip, please share your live location before the ride begins using the link below:

🔗 ${trackingUrl}

This helps your driver (and us) keep track of your journey for better safety and support.

If you have any questions, feel free to reach out to our support team.

Safe travels,  
The Vroom Team`,
  html: `
    <div style="font-family: Arial, sans-serif; line-height:1.6; color:#333;">
      <h2 style="color:#007BFF;">Your Vroom Ride Starts Tomorrow</h2>
      <p>Hello,</p>
      <p>Your scheduled ride with <strong>Vroom</strong> is starting tomorrow! 🎉</p>
      <p>Please share your live location before the ride begins:</p>
      <p style="text-align:center; margin:20px 0;">
        <a href="${trackingUrl}" 
           style="background-color:#007BFF; color:white; padding:12px 20px; text-decoration:none; border-radius:6px; font-weight:bold;">
           Share Live Location
        </a>
      </p>
      <p>This helps your driver (and us) keep track of your journey for safety.</p>
      <p>If you have any questions, contact our support team.</p>
      <p>Safe travels,<br/>The Vroom Team 🚗</p>
    </div>
  `,
});

export const carVerificationRejectedTemplate = (
  userName: string,
  carName: string,
  reason: string | undefined
) => ({
  subject: '❌ Vroom Car Verification Rejected',
  text: `Dear ${userName},

Your car "${carName}" verification has been rejected due to the following reason:

👉 ${reason}

Please address the issue and reapply.

Best regards,
Vroom Support Team 🚗`,
  html: `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2 style="color: #d9534f;">❌ Car Verification Rejected</h2>
    <p>Dear ${userName},</p>
    <p>Your car "<strong>${carName}</strong>" verification has been rejected for the following reason:</p>
    <blockquote style="background:#f8d7da; padding:10px; border-left:4px solid #d9534f; margin:10px 0;">
      ${reason}
    </blockquote>
    <p>Please review the issue and reapply for verification.</p>
    <p style="margin-top:30px;">Best regards,<br/><strong>Vroom Support Team 🚗</strong></p>
  </div>
  `,
});

export const passwordResetTemplate = (name: string, resetLink: string) => ({
  subject: '🔒 Reset Your Vroom Password',
  text: `Dear ${name},

We received a request to reset the password for your Vroom account.

Please click the link below to set a new password:
${resetLink}

This link will expire in 15 minutes. 
If you did not request this, please ignore this email.

Best regards,
The Vroom Team 🚗`,

  html: `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2 style="color: #007BFF;">Reset Your Vroom Password</h2>
    <p>Dear ${name},</p>
    <p>We received a request to reset the password for your <strong>Vroom</strong> account.</p>
    <p>Please click the button below to set a new password:</p>
    
    <p style="text-align: center; margin: 20px 0;">
      <a href="${resetLink}" 
         style="background-color: #007BFF; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">
        Reset Password
      </a>
    </p>

    <p>This link will expire in <strong>15 minutes</strong>.</p>
    <p>If you did not request this, you can safely ignore this email.</p>

    <p style="margin-top: 30px;">Best regards,</p>
    <p><strong>The Vroom Team 🚗</strong></p>
  </div>
  `,
});
