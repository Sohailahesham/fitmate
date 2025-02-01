require("dotenv").config();
const nodemailer = require("nodemailer");
const oAuth2Client = require("../config/oAuth2Client");

const sendMail = async (user, output) => {
  const accessToken = await oAuth2Client.getAccessToken();
  //   console.log("Access Token:", accessToken);
  if (!accessToken) {
    throw new Error("Failed to retrieve access token");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.MY_EMAIL,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
      accessToken: accessToken.token,
    },
  });

  const mailOptions = {
    from: `"Fit Mate" <${process.env.MY_EMAIL}>`,
    to: user.email,
    subject: "Verification email",
    html: output,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
};

module.exports = { sendMail };
