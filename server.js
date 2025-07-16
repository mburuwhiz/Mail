require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

function generateEmailTemplate(message) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <p>${message}</p><br />
      <p>
        <strong>CONFIDENTIAL NOTICE:</strong>
        <em> This email from Dedan Kimathi University of Technology is confidential and may contain sensitive information. It is intended solely for the recipient. Any unauthorized access, use, disclosure, or distribution is strictly prohibited. The university is not responsible for any harm caused by viruses. By receiving this email, you consent to the processing of personal data in accordance with Kenya’s Data Protection Act, 2019.</em>
      </p>
    </div>
  `;
}

app.post('/send-email', async (req, res) => {
  const { to, subject, message } = req.body;

  if (!to || !subject || !message) {
    return res.status(400).json({ error: 'To, subject, and message are required.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const htmlBody = generateEmailTemplate(message);
    const textFooter = "CONFIDENTIAL NOTICE: This email from Dedan Kimathi University of Technology is confidential and may contain sensitive information. It is intended solely for the recipient. Any unauthorized access, use, disclosure, or distribution is strictly prohibited. The university is not responsible for any harm caused by viruses. By receiving this email, you consent to the processing of personal data in accordance with Kenya’s Data Protection Act, 2019.";
    
    const mailOptions = {
      from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_EMAIL}>`,
      to,
      subject,
      text: `${message}\n\n${textFooter}`,
      html: htmlBody,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: '✅ Email sent successfully!' });
  } catch (error) {
    console.error('Send error:', error);
    res.status(500).json({ error: '❌ Failed to send email.' });
  }
});

app.listen(PORT, () => {
  console.log(`📬 WHIZ Mailer running at http://localhost:${PORT}`);
});
