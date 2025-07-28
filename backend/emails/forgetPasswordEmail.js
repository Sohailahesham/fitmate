module.exports = (username, token) => `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center;">
            <h1>Password Reset Request</h1>
        </div>
        <div style="margin-top: 20px;">
            <p>Hi ${username},</p>
            <p>We received a request to reset your password. Click the button below to reset your password:</p>
            <a href="http://localhost:3000/api/auth/resetPassword/${token}" style="display: inline-block; padding: 10px 20px; color: #ffffff; background-color: #007bff; border-radius: 5px; text-decoration: none;">Reset Password</a>
            <p>If you did not request a password reset, please ignore this email.</p>
        </div>
        <div style="margin-top: 20px; text-align: center; color: #777777;">
            <p>&copy; 2025 FitMate. All rights reserved.</p>
        </div>
    </div>
`;
