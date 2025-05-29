const nodemailer = require("nodemailer");
const juice = require("juice");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateStyledEmailHTML = (
  websiteName,
  userName,
  emailTitle,
  mainMessage,
  actionLink,
  linkText,
  expiryInfo,
  footerText
) => {
  return `
 <!DOCTYPE html>
<html>
<head>
 <meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
 <title>${emailTitle}</title>
 <style>
 body {
   font-family: Arial, sans-serif;
   margin: 0;
   padding: 20px;
   background-color: #f4f4f4;
   color: #333333;
 }
 .container {
   background-color: #ffffff;
   padding: 30px;
   border-radius: 8px;
   box-shadow: 0 4px 8px rgba(0,0,0,0.1);
   max-width: 600px;
   margin: auto;
 }
 .header {
   font-size: 24px;
   color: #0FCE7C; /* Your brand color */
   margin-bottom: 20px;
   text-align: center;
 }
 .user-greeting {
   font-size: 18px;
   margin-bottom: 20px;
   line-height: 1.5;
 }
 .main-message-text { /* Changed from .confirmation-text for generality */
   font-size: 16px;
   margin-bottom: 25px;
   line-height: 1.5;
 }
 .action-link-container { /* Changed from .confirmation-link-container */
   text-align: center;
   margin-bottom: 25px;
 }
 .action-link { /* Changed from .confirmation-link */
   display: inline-block;
   padding: 12px 25px;
   background-color: #0FCE7C; /* Your brand color */
   color: #ffffff; /* White text for better contrast */
   border-radius: 8px;
   text-decoration: none;
   font-size: 16px;
   font-weight: bold;
   border: 1px solid #0FCE7C; /* Matching border */
 }
 .action-link:hover {
    background-color: #0DAA69; /* Slightly darker shade for hover */
    border-color: #0DAA69;
 }
 .expiry-info {
   font-size: 14px;
   color: rgb(98, 98, 98);
   text-align: center;
   margin-bottom: 20px;
   margin-top: 10px;
 }
 .footer-text {
   font-size: 14px;
   color: #777777;
   text-align: center;
   margin-top: 30px;
 }
</style>
</head>
 <body>
<div class="container">
 <h1 class="header">${websiteName}</h1>
 <p class="user-greeting">Hello ${userName},</p>
 <p class="main-message-text">${mainMessage}</p>
 <div class="action-link-container">
   <a href="${actionLink}" class="action-link">${linkText}</a>
 </div>
 ${expiryInfo ? `<p class="expiry-info">${expiryInfo}</p>` : ''}
 <p class="footer-text">${footerText}</p>
</div>
</body>
</html>
`;
};

const sendEmail = async ({
  email,
  subject,
  websiteName,
  userName,
  mainMessage,
  actionLink,
  linkText,
  expiryInfo,
  footerText,
}) => {
  try {
    const rawHtmlContent = generateStyledEmailHTML(
      websiteName,
      userName,
      subject, 
      mainMessage,
      actionLink,
      linkText,
      expiryInfo,
      footerText
    );

    const inlinedHtmlContent = juice(rawHtmlContent);

    const mailOptions = {
      from: `"${websiteName}" <${process.env.EMAIL_USER}>`, 
      to: email,
      subject: subject,
      html: inlinedHtmlContent, 
    };

    console.log(
      `Attempting to send email to ${email} with subject: "${subject}"`
    );
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent via NodeMailer:", info.response);
    return info;
  } catch (error) {
    console.error("Error sending email via NodeMailer:", error);
    throw new Error(`Failed to send email: ${error.message || error}`);
  }
};

module.exports = { sendEmail };