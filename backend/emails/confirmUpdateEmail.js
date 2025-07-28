module.exports = (username, token) => `
  <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); font-family: Arial, sans-serif;">
    <div style="text-align: center;">
        <h1>Email Verification</h1>
    </div>
    <div style="margin-top: 20px;">
        <p>Hi ${username},</p>
        <p>You’ve recently updated your email address on FitMate. To complete the process and verify your new email, please click the button below:</p>
        <a href="http://localhost:3000/api/auth/verify-email/${token}" style="display: inline-block; padding: 10px 20px; color: #ffffff; background-color: #007bff; border-radius: 5px; text-decoration: none;">Verify New Email</a>
        <p>If you did not request this change, please contact our support team immediately.</p>
    </div>
    <div style="margin-top: 20px; text-align: center; color: #777777;">
        <p>&copy; 2025 FitMate. All rights reserved.</p>
    </div>
  </div>
`;
