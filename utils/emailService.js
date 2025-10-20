const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false 
  }
});

// Verify transporter
transporter.verify((error, success) => {
  if (error) { 
    console.log('Email transporter error:', error);
  } else {
    console.log('Email transporter is ready');
  }
});

module.exports.sendWelcomeEmail = async (toEmail, firstName) => {
      const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: 'Welcome to EduVision AI',
    text: `Hi ${firstName},

    Welcome to EduVision AI — your personalized learning companion!

    We're thrilled to have you on board. EduVision is built to help you study smarter, faster, and more confidently. Whether you're preparing for exams, brushing up on concepts, or exploring new topics, we've got tools designed to support your journey.

    Here's what you can expect:
    • Personalized study guides tailored to your learning style  
    • AI-powered quizzes to reinforce your understanding  
    • Smart flashcards that adapt to your progress  
    • A dashboard to track your growth and stay motivated  

    If you ever need help or have feedback, we're just a message away. Your success is our mission, and we're excited to be part of your learning story.

    Thanks again for joining us — let’s make learning something you look forward to every day.

    Warm regards,  
    The EduVision AI Team  
    solabode499@gmail.com
        `
    };
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Contact Us email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email sending error:', error);
        return { success: false, error: error.message };
  }
};

module.exports.sendPasswordResetEmail = async (toEmail, firstName, resetCode) => {
  try {
    await transporter.sendMail({
      from: `EduVision AI <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: 'Reset Your EduVision AI Password',
      html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
      <h2 style="color: #333;">Hi ${firstName},</h2>

      <p>We received a request to reset your password for your <strong>EduVision AI</strong> account.</p>

      <p style="margin-top: 20px;">Here is your password reset code:</p>
      <p style="font-size: 24px; font-weight: bold; color: #2c3e50; margin: 10px 0;">
        ${resetCode}
      </p>

      <p>Please enter this code on the password reset page to create a new password. This code will expire in <strong>30 minutes</strong> for security reasons.</p>

      <p>If you didn’t request a password reset, you can safely ignore this email. Your account is still secure and no changes have been made.</p>

      <p style="margin-top: 30px;">Need help? Just reply to this email or reach out to our support team.</p>

      <p style="margin-top: 40px;">Stay curious,<br><strong>The EduVision AI Team</strong><br>${process.env.GMAIL_USER}</p>
    </div>
  `
});


    console.log(`✅ Password reset email sent to ${toEmail}`);
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error);
  }
}