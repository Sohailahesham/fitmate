module.exports = (username, token) => `
  <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
    <div style="text-align: center;">
        <h1>Email Verification</h1>
    </div>
    <div style="margin-top: 20px;">
        <p>Hi ${username},</p>
        <p>Thank you for registering with FitMate! Please click the button below to verify your email address:</p>
        <a href="http://localhost:3000/api/auth/register/confirm/${token}" style="display: inline-block; padding: 10px 20px; color: #ffffff; background-color: #28a745; border-radius: 5px; text-decoration: none;">Verify Email</a>
        <p>If you did not create an account, please ignore this email.</p>
    </div>
    <div style="margin-top: 20px; text-align: center; color: #777777;">
        <p>&copy; 2025 FitMate. All rights reserved.</p>
    </div>
</div>`;
