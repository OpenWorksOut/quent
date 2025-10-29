const nodemailer = require("nodemailer");
const config = require(".");

// Create transporter using SMTP settings from config
function createTransporter() {
  const smtp = config.email && config.email.smtp;
  if (!smtp || !smtp.host) return null;

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port ? parseInt(smtp.port, 10) : 587,
    secure: smtp.port === "465" || smtp.port === 465, // true for 465, false for other ports
    auth: smtp.auth && smtp.auth.user ? smtp.auth : undefined,
  });

  return transporter;
}

const transporter = createTransporter();

async function sendMail(to, subject, text, html) {
  if (!transporter) {
    // If no transporter configured, just log and resolve (useful for local/dev)
    console.warn("No SMTP transporter configured. Skipping email send.", {
      to,
      subject,
    });
    return Promise.resolve();
  }

  const from = config.email && config.email.from;

  const info = await transporter.sendMail({
    from: from || "no-reply@quantfinsuite.com",
    to,
    subject,
    text,
    html,
  });

  return info;
}

module.exports = sendMail;
