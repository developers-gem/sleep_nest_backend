const nodemailer = require('nodemailer');
const config = require('../config');

let transporterPromise = (async () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    const testAccount = await nodemailer.createTestAccount();
    console.log('Ethereal test account created');
    console.log('User:', testAccount.user);
    console.log('Pass:', testAccount.pass);
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
})();

async function sendVerificationEmail(toEmail, token) {
  const transporter = await transporterPromise;
  const verificationUrl = `${process.env.APP_BASE_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${token}`;
  const info = await transporter.sendMail({
    from: config.EMAIL_FROM,
    to: toEmail,
    subject: 'Sleepnest Email Verification',
    text: `Please verify your email by clicking the link: ${verificationUrl}`,
    html: `<p>Please verify your email by clicking the link:</p><p><a href="${verificationUrl}">${verificationUrl}</a></p>`,
  });
  if (nodemailer.getTestMessageUrl(info)) {
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
  }
}

module.exports = { sendVerificationEmail };
