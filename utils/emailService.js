const { Resend } = require('resend');

const resend = new Resend(process.env.resend_API_KEY);

async function sendWelcomeEmail(toEmail, userName) {
  try {
    const response = await resend.emails.send({
      from: 'EduVision AI <solabode499@gmail.com>', 
      to: toEmail,
      subject: 'Welcome to EduVision AI!',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Hi ${userName},</h2>
          <p>Thanks for joining <strong>EduVision AI</strong> — your personalized learning companion.</p>
          <p>We’re excited to help you grow smarter, faster, and more confident.</p>
          <br>
          <p>Cheers,<br>The EduVision Team</p>
        </div>
      `
    });

    console.log('✅ Email sent:', response);
  } catch (error) {
    console.error('❌ Email failed:', error);
  }
}

module.exports = { sendWelcomeEmail };