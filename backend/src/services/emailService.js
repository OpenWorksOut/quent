const nodemailer = require('nodemailer');

// Create transporter with enhanced configuration for production deployment
const createTransporter = () => {
  const config = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true' || false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    // Enhanced configuration for production deployment
    connectionTimeout: 60000, // 60 seconds
    greetingTimeout: 30000, // 30 seconds
    socketTimeout: 60000, // 60 seconds
    pool: true, // Use connection pooling
    maxConnections: 5, // Max concurrent connections
    maxMessages: 100, // Max messages per connection
    rateLimit: 14, // Max messages per second
    // TLS configuration
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
      ciphers: 'SSLv3'
    }
  };

  // Remove auth if credentials are not provided
  if (!config.auth.user || !config.auth.pass) {
    delete config.auth;
    console.warn('SMTP credentials not provided. Email functionality will be limited.');
  }

  return nodemailer.createTransport(config);
};

const transporter = createTransporter();

// Enhanced email sending with retry logic and better error handling
const sendEmailWithRetry = async (mailOptions, emailType, recipient, maxRetries = 3) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Verify transporter connection before sending
      if (attempt === 1) {
        await transporter.verify();
      }
      
      const info = await transporter.sendMail(mailOptions);
      console.log(`${emailType} sent successfully to ${recipient} (attempt ${attempt})`);
      return info;
    } catch (error) {
      lastError = error;
      console.error(`Failed to send ${emailType} to ${recipient} (attempt ${attempt}/${maxRetries}):`, {
        error: error.message,
        code: error.code,
        command: error.command,
        response: error.response
      });
      
      // Don't retry on authentication errors
      if (error.code === 'EAUTH' || error.responseCode === 535) {
        console.error('Authentication failed. Check SMTP credentials.');
        throw error;
      }
      
      // Don't retry on invalid recipient errors
      if (error.responseCode >= 500 && error.responseCode < 600) {
        console.error('Permanent email error. Not retrying.');
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s...
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // If all retries failed, throw the last error
  console.error(`All ${maxRetries} attempts failed for ${emailType} to ${recipient}`);
  throw lastError;
};

// Professional Banking Email Template
const createEmailTemplate = (title, content, actionButton = null, customerName = '', accountInfo = {}) => {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} - QuentBank</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Arial', 'Helvetica', sans-serif;
          background-color: #f4f6f9;
          line-height: 1.6;
          color: #333333;
        }
        .email-container {
          max-width: 650px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .header {
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
          color: white;
          padding: 30px;
          text-align: center;
          position: relative;
        }
        .header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #fbbf24, #f59e0b, #d97706);
        }
        .logo {
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 8px;
          letter-spacing: 1px;
        }
        .tagline {
          font-size: 14px;
          opacity: 0.9;
          font-weight: 300;
        }
        .customer-info {
          background-color: #f8fafc;
          padding: 20px 30px;
          border-bottom: 1px solid #e2e8f0;
        }
        .customer-info h3 {
          margin: 0 0 10px 0;
          color: #1e40af;
          font-size: 18px;
        }
        .customer-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          font-size: 14px;
        }
        .detail-item {
          display: flex;
          justify-content: space-between;
        }
        .detail-label {
          font-weight: 600;
          color: #4b5563;
        }
        .detail-value {
          color: #1f2937;
        }
        .content {
          padding: 30px;
        }
        .title {
          font-size: 24px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 20px;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 10px;
        }
        .text {
          font-size: 16px;
          color: #4b5563;
          margin-bottom: 20px;
          line-height: 1.7;
        }
        .highlight-box {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border: 1px solid #0ea5e9;
          border-left: 5px solid #0284c7;
          padding: 25px;
          margin: 25px 0;
          border-radius: 8px;
        }
        .highlight-title {
          font-size: 18px;
          font-weight: 600;
          color: #0c4a6e;
          margin: 0 0 15px 0;
          display: flex;
          align-items: center;
        }
        .highlight-title::before {
          content: '🏦';
          margin-right: 10px;
          font-size: 20px;
        }
        .account-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 15px;
        }
        .account-detail {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e0f2fe;
        }
        .account-label {
          font-weight: 600;
          color: #0c4a6e;
        }
        .account-value {
          color: #1e40af;
          font-weight: 500;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          color: white;
          padding: 16px 32px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          margin: 25px 0;
          box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);
          transition: all 0.3s ease;
          text-align: center;
          display: block;
          max-width: 250px;
        }
        .security-notice {
          background-color: #fef3c7;
          border: 1px solid #f59e0b;
          border-left: 5px solid #d97706;
          padding: 20px;
          margin: 25px 0;
          border-radius: 8px;
        }
        .security-title {
          font-weight: 600;
          color: #92400e;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
        }
        .security-title::before {
          content: '🔒';
          margin-right: 8px;
        }
        .footer {
          background-color: #f8fafc;
          padding: 30px;
          border-top: 1px solid #e2e8f0;
        }
        .company-info {
          text-align: center;
          margin-bottom: 25px;
        }
        .company-name {
          font-size: 20px;
          font-weight: bold;
          color: #1e40af;
          margin-bottom: 10px;
        }
        .company-details {
          font-size: 14px;
          color: #6b7280;
          line-height: 1.5;
        }
        .contact-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin: 25px 0;
          text-align: center;
        }
        .contact-item {
          padding: 15px;
          background-color: white;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }
        .contact-label {
          font-weight: 600;
          color: #374151;
          margin-bottom: 5px;
        }
        .contact-value {
          color: #1e40af;
          font-size: 14px;
        }
        .legal-disclaimer {
          font-size: 11px;
          color: #9ca3af;
          line-height: 1.4;
          margin-top: 25px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }
        .social-links {
          text-align: center;
          margin: 20px 0;
        }
        .social-link {
          display: inline-block;
          margin: 0 15px;
          color: #1e40af;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
        }
        .social-link:hover {
          text-decoration: underline;
        }
        @media (max-width: 600px) {
          .email-container {
            margin: 10px;
            border-radius: 0;
          }
          .header, .content, .footer {
            padding: 20px;
          }
          .customer-details {
            grid-template-columns: 1fr;
          }
          .account-details {
            grid-template-columns: 1fr;
          }
          .contact-info {
            grid-template-columns: 1fr;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <!-- Header -->
        <div class="header">
          <div class="logo">QuentBank</div>
          <div class="tagline">Your Trusted Financial Partner Since 1995</div>
        </div>
        
        <!-- Customer Information -->
        ${customerName ? `
        <div class="customer-info">
          <h3>Account Holder Information</h3>
          <div class="customer-details">
            <div class="detail-item">
              <span class="detail-label">Name:</span>
              <span class="detail-value">${customerName}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Date:</span>
              <span class="detail-value">${currentDate}</span>
            </div>
            ${accountInfo.accountNumber ? `
            <div class="detail-item">
              <span class="detail-label">Account:</span>
              <span class="detail-value">****${accountInfo.accountNumber.slice(-4)}</span>
            </div>
            ` : ''}
            <div class="detail-item">
              <span class="detail-label">Reference:</span>
              <span class="detail-value">#${Date.now().toString().slice(-8)}</span>
            </div>
          </div>
        </div>
        ` : ''}
        
        <!-- Main Content -->
        <div class="content">
          <h1 class="title">${title}</h1>
          ${content}
          ${actionButton || ''}
          
          <!-- Security Notice -->
          <div class="security-notice">
            <div class="security-title">Security Reminder</div>
            <p style="margin: 0; font-size: 14px; color: #92400e;">
              QuentBank will never ask for your login credentials, PIN, or personal information via email. 
              If you receive suspicious emails, please report them to security@quentbank.com immediately.
            </p>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <div class="company-info">
            <div class="company-name">QuentBank Corporation</div>
            <div class="company-details">
              Regulated by the Federal Deposit Insurance Corporation (FDIC)<br>
              Member FDIC | Equal Housing Lender | NMLS ID: 123456
            </div>
          </div>
          
          <div class="contact-info">
            <div class="contact-item">
              <div class="contact-label">Customer Service</div>
              <div class="contact-value">1-800-QUENT-1<br>(1-800-786-3681)</div>
            </div>
            <div class="contact-item">
              <div class="contact-label">Online Banking</div>
              <div class="contact-value">www.quentbank.com<br>Available 24/7</div>
            </div>
            <div class="contact-item">
              <div class="contact-label">Headquarters</div>
              <div class="contact-value">123 Financial District<br>New York, NY 10001</div>
            </div>
          </div>
          
          <div class="social-links">
            <a href="#" class="social-link">Privacy Policy</a>
            <a href="#" class="social-link">Terms & Conditions</a>
            <a href="#" class="social-link">Security Center</a>
            <a href="#" class="social-link">Contact Us</a>
            <a href="#" class="social-link">Unsubscribe</a>
          </div>
          
          <div class="legal-disclaimer">
            <strong>IMPORTANT LEGAL INFORMATION:</strong><br>
            This email and any attachments are confidential and intended solely for the addressee. 
            If you are not the intended recipient, please notify the sender immediately and delete this email. 
            QuentBank does not accept responsibility for any viruses or malware that may be contained in this email.<br><br>
            
            <strong>REGULATORY INFORMATION:</strong><br>
            QuentBank Corporation is a member of the Federal Deposit Insurance Corporation (FDIC). 
            Deposits are insured up to $250,000 per depositor, per bank. Investment products are not FDIC insured, 
            not bank guaranteed, and may lose value.<br><br>
            
            <strong>COPYRIGHT NOTICE:</strong><br>
            © 2024 QuentBank Corporation. All rights reserved. QuentBank and the QuentBank logo are 
            registered trademarks of QuentBank Corporation. Unauthorized use is prohibited.<br><br>
            
            This is an automated message from QuentBank. Please do not reply to this email address. 
            For assistance, please contact customer service at 1-800-QUENT-1 or visit www.quentbank.com.
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Account creation email
const sendAccountCreationEmail = async (userEmail, userName, accountDetails) => {
  const content = `
    <p class="text">Dear ${userName},</p>
    
    <p class="text">
      <strong>Welcome to QuentBank!</strong> We are pleased to confirm that your new ${accountDetails.accountType} account 
      has been successfully opened and is now active. Thank you for choosing QuentBank as your trusted financial partner.
    </p>
    
    <div class="highlight-box">
      <h3 class="highlight-title">Your New Account Details</h3>
      <div class="account-details">
        <div class="account-detail">
          <span class="account-label">Account Name:</span>
          <span class="account-value">${accountDetails.name}</span>
        </div>
        <div class="account-detail">
          <span class="account-label">Account Number:</span>
          <span class="account-value">****${accountDetails.accountNumber.slice(-4)}</span>
        </div>
        <div class="account-detail">
          <span class="account-label">Account Type:</span>
          <span class="account-value">${accountDetails.accountType.charAt(0).toUpperCase() + accountDetails.accountType.slice(1)}</span>
        </div>
        <div class="account-detail">
          <span class="account-label">Currency:</span>
          <span class="account-value">${accountDetails.currency}</span>
        </div>
        <div class="account-detail">
          <span class="account-label">Current Balance:</span>
          <span class="account-value">$${accountDetails.balance.toFixed(2)}</span>
        </div>
        <div class="account-detail">
          <span class="account-label">Status:</span>
          <span class="account-value" style="color: #059669;">Active</span>
        </div>
      </div>
      <p style="margin: 15px 0 0 0; font-size: 14px; color: #0c4a6e;">
        <strong>Important:</strong> Please keep your account number confidential and never share it with unauthorized parties.
      </p>
    </div>
    
    <p class="text">
      Your account is fully operational and you can immediately begin:
    </p>
    <ul style="color: #4b5563; margin-left: 20px; line-height: 1.8;">
      <li><strong>Online Banking:</strong> Access your account 24/7 through our secure web portal</li>
      <li><strong>Mobile Banking:</strong> Download our mobile app for banking on the go</li>
      <li><strong>Fund Transfers:</strong> Send and receive money instantly</li>
      <li><strong>Bill Payments:</strong> Set up automatic payments for your bills</li>
      <li><strong>Account Management:</strong> View statements, set alerts, and manage preferences</li>
    </ul>
    
    <p class="text">
      <strong>Getting Started:</strong> We recommend logging into your online banking account to:
    </p>
    <ul style="color: #4b5563; margin-left: 20px; line-height: 1.8;">
      <li>Complete your profile setup</li>
      <li>Set up security alerts and notifications</li>
      <li>Add funds to your account via transfer or direct deposit</li>
      <li>Explore our comprehensive banking features</li>
    </ul>
    
    <p class="text">
      If you have any questions about your new account or need assistance with online banking, 
      our customer service team is available 24/7 at <strong>1-800-QUENT-1</strong> or you can 
      visit any of our branch locations.
    </p>
  `;
  
  const actionButton = `
    <a href="${process.env.FRONTEND_URL || 'https://quentbank.com'}/dashboard" class="button">
      🏦 Access Your Account Dashboard
    </a>
  `;
  
  const html = createEmailTemplate(
    'Account Successfully Opened', 
    content, 
    actionButton, 
    userName, 
    accountDetails
  );
  
  const mailOptions = {
    from: `"QuentBank Customer Service" <${process.env.SMTP_USER}>`,
    to: userEmail,
    subject: 'Account Confirmation - Welcome to QuentBank',
    html: html,
    headers: {
      'X-Priority': '1',
      'X-MSMail-Priority': 'High',
      'Importance': 'high'
    }
  };
  
  return await sendEmailWithRetry(mailOptions, 'Account creation email', userEmail);
};

// Transfer notification email
const sendTransferNotificationEmail = async (userEmail, userName, transferDetails) => {
  const isOutgoing = transferDetails.type === 'outgoing';
  const title = isOutgoing ? 'Transfer Confirmation - Funds Sent' : 'Transfer Notification - Funds Received';
  const transferDate = new Date(transferDetails.date);
  
  const content = `
    <p class="text">Dear ${userName},</p>
    
    <p class="text">
      This email confirms that a ${isOutgoing ? 'outgoing' : 'incoming'} transfer has been 
      ${isOutgoing ? 'successfully processed from' : 'received into'} your QuentBank account. 
      ${isOutgoing 
        ? 'The funds have been debited from your account and sent to the recipient.' 
        : 'The funds have been credited to your account and are immediately available for use.'}
    </p>
    
    <div class="highlight-box">
      <h3 class="highlight-title">Transaction Summary</h3>
      <div class="account-details">
        <div class="account-detail">
          <span class="account-label">Transaction Type:</span>
          <span class="account-value">${isOutgoing ? 'Outgoing Transfer' : 'Incoming Transfer'}</span>
        </div>
        <div class="account-detail">
          <span class="account-label">Amount:</span>
          <span class="account-value" style="font-size: 18px; font-weight: bold;">$${transferDetails.amount.toFixed(2)} USD</span>
        </div>
        <div class="account-detail">
          <span class="account-label">${isOutgoing ? 'From Account:' : 'To Account:'}</span>
          <span class="account-value">${isOutgoing ? transferDetails.fromAccount : transferDetails.toAccount}</span>
        </div>
        <div class="account-detail">
          <span class="account-label">${isOutgoing ? 'To Account:' : 'From Account:'}</span>
          <span class="account-value">${isOutgoing ? transferDetails.toAccount : transferDetails.fromAccount}</span>
        </div>
        <div class="account-detail">
          <span class="account-label">Transaction ID:</span>
          <span class="account-value">${transferDetails.reference}</span>
        </div>
        <div class="account-detail">
          <span class="account-label">Date & Time:</span>
          <span class="account-value">${transferDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })} at ${transferDate.toLocaleTimeString('en-US')}</span>
        </div>
        <div class="account-detail">
          <span class="account-label">Status:</span>
          <span class="account-value" style="color: #059669; font-weight: 600;">✓ Completed</span>
        </div>
        ${transferDetails.note ? `
        <div class="account-detail" style="grid-column: 1 / -1;">
          <span class="account-label">Memo:</span>
          <span class="account-value">${transferDetails.note}</span>
        </div>
        ` : ''}
      </div>
      <p style="margin: 15px 0 0 0; font-size: 14px; color: #0c4a6e;">
        <strong>Important:</strong> Please retain this confirmation for your records. 
        Transaction details are also available in your online banking account.
      </p>
    </div>
    
    <p class="text">
      <strong>${isOutgoing ? 'Transfer Completed:' : 'Funds Available:'}</strong> 
      ${isOutgoing 
        ? 'Your transfer has been successfully processed and the recipient should receive the funds immediately. You will see this transaction reflected in your account balance and statement.'
        : 'The transferred funds are now available in your account and can be used for transactions, withdrawals, or additional transfers immediately.'}
    </p>
    
    <p class="text">
      <strong>What you can do next:</strong>
    </p>
    <ul style="color: #4b5563; margin-left: 20px; line-height: 1.8;">
      <li>View detailed transaction history in your online banking dashboard</li>
      <li>Download or print this transaction confirmation for your records</li>
      <li>Set up account alerts to be notified of future transactions</li>
      <li>Contact customer service if you have any questions about this transfer</li>
    </ul>
    
    <p class="text">
      If you did not authorize this transaction or notice any suspicious activity, 
      please contact our fraud prevention team immediately at <strong>1-800-SECURE-1</strong> 
      or report it through your online banking security center.
    </p>
  `;
  
  const actionButton = `
    <a href="${process.env.FRONTEND_URL || 'https://securebank.com'}/transactions" class="button">
      📊 View Transaction History
    </a>
  `;
  
  const html = createEmailTemplate(
    title, 
    content, 
    actionButton, 
    userName, 
    { accountNumber: transferDetails.fromAccount }
  );
  
  const mailOptions = {
    from: `"QuentBank Transaction Alerts" <${process.env.SMTP_USER}>`,
    to: userEmail,
    subject: `${isOutgoing ? '💸' : '💰'} ${title} - Transaction #${transferDetails.reference.toString().slice(-6)}`,
    html: html,
    headers: {
      'X-Priority': '2',
      'X-MSMail-Priority': 'Normal',
      'Importance': 'normal'
    }
  };
  
  return await sendEmailWithRetry(mailOptions, 'Transfer notification email', userEmail);
};

// Security alert email
const sendSecurityAlertEmail = async (userEmail, userName, alertDetails) => {
  const alertDate = new Date(alertDetails.timestamp);
  
  const content = `
    <p class="text">Dear ${userName},</p>
    
    <p class="text">
      <strong>SECURITY ALERT:</strong> We have detected unusual activity on your QuentBank account. 
      As part of our commitment to protecting your financial information, we are notifying you of this activity 
      and providing details for your review.
    </p>
    
    <div style="background-color: #fef2f2; border: 1px solid #fca5a5; border-left: 5px solid #dc2626; padding: 25px; margin: 25px 0; border-radius: 8px;">
      <h3 style="margin: 0 0 15px 0; color: #dc2626; font-size: 18px; display: flex; align-items: center;">
        🚨 Security Activity Detected
      </h3>
      <div class="account-details">
        <div class="account-detail">
          <span class="account-label">Activity Type:</span>
          <span class="account-value" style="color: #dc2626; font-weight: 600;">${alertDetails.activity}</span>
        </div>
        <div class="account-detail">
          <span class="account-label">Date & Time:</span>
          <span class="account-value">${alertDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })} at ${alertDate.toLocaleTimeString('en-US')}</span>
        </div>
        <div class="account-detail">
          <span class="account-label">IP Address:</span>
          <span class="account-value">${alertDetails.ipAddress}</span>
        </div>
        <div class="account-detail">
          <span class="account-label">Location:</span>
          <span class="account-value">${alertDetails.location || 'Location not available'}</span>
        </div>
        <div class="account-detail">
          <span class="account-label">Device/Browser:</span>
          <span class="account-value">${alertDetails.userAgent || 'Unknown device'}</span>
        </div>
        <div class="account-detail">
          <span class="account-label">Alert ID:</span>
          <span class="account-value">#SEC${Date.now().toString().slice(-8)}</span>
        </div>
      </div>
      <p style="margin: 15px 0 0 0; font-size: 14px; color: #dc2626;">
        <strong>Action Required:</strong> Please review this activity and take appropriate action if necessary.
      </p>
    </div>
    
    <div style="background-color: #f0fdf4; border: 1px solid #86efac; border-left: 5px solid #16a34a; padding: 20px; margin: 25px 0; border-radius: 8px;">
      <h4 style="margin: 0 0 10px 0; color: #16a34a; display: flex; align-items: center;">
        ✅ If this was you:
      </h4>
      <p style="margin: 0; font-size: 14px; color: #15803d;">
        No further action is required. Your account remains secure and this alert can be disregarded. 
        You may want to consider enabling additional security features for enhanced protection.
      </p>
    </div>
    
    <div style="background-color: #fef3c7; border: 1px solid #fbbf24; border-left: 5px solid #d97706; padding: 20px; margin: 25px 0; border-radius: 8px;">
      <h4 style="margin: 0 0 10px 0; color: #d97706; display: flex; align-items: center;">
        ⚠️ If this was NOT you:
      </h4>
      <p style="margin: 0 0 15px 0; font-size: 14px; color: #92400e;">
        <strong>Take immediate action:</strong>
      </p>
      <ul style="color: #92400e; margin: 0; padding-left: 20px; font-size: 14px;">
        <li>Contact our fraud prevention team immediately at <strong>1-800-QUENT-1</strong></li>
        <li>Change your online banking password immediately</li>
        <li>Review your recent account activity and transactions</li>
        <li>Consider enabling two-factor authentication</li>
        <li>Monitor your account closely for any unauthorized activity</li>
      </ul>
    </div>
    
    <p class="text">
      <strong>Additional Security Recommendations:</strong>
    </p>
    <ul style="color: #4b5563; margin-left: 20px; line-height: 1.8;">
      <li><strong>Enable Account Alerts:</strong> Set up real-time notifications for all account activity</li>
      <li><strong>Use Strong Passwords:</strong> Create unique, complex passwords for your banking accounts</li>
      <li><strong>Secure Your Devices:</strong> Keep your devices updated and use antivirus software</li>
      <li><strong>Monitor Regularly:</strong> Check your account statements and activity frequently</li>
      <li><strong>Report Suspicious Activity:</strong> Contact us immediately if you notice anything unusual</li>
    </ul>
    
    <p class="text">
      Remember, QuentBank will never ask for your login credentials, PIN, or personal information via email, 
      phone, or text message. If you receive any suspicious communications claiming to be from QuentBank, 
      please report them to our security team immediately.
    </p>
  `;
  
  const actionButton = `
    <a href="${process.env.FRONTEND_URL || 'https://quentbank.com'}/settings/security" class="button" style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);">
      🔒 Review Security Settings
    </a>
  `;
  
  const html = createEmailTemplate(
    'URGENT: Security Alert', 
    content, 
    actionButton, 
    userName, 
    {}
  );
  
  const mailOptions = {
    from: `"QuentBank Security Team" <${process.env.SMTP_USER}>`,
    to: userEmail,
    subject: '🚨 SECURITY ALERT: Unusual Account Activity Detected - Immediate Attention Required',
    html: html,
    headers: {
      'X-Priority': '1',
      'X-MSMail-Priority': 'High',
      'Importance': 'high'
    }
  };
  
  return await sendEmailWithRetry(mailOptions, 'Security alert email', userEmail);
};

// Email verification OTP
const sendEmailVerificationOTP = async (userEmail, userName, otp) => {
  const content = `
    <p class="text">Dear ${userName},</p>
    
    <p class="text">
      Thank you for registering with QuentBank. To complete your account setup and ensure the security 
      of your account, please verify your email address using the verification code below.
    </p>
    
    <div class="highlight-box">
      <h3 class="highlight-title">Email Verification Required</h3>
      <div style="text-align: center; padding: 20px;">
        <p style="margin: 0 0 15px 0; font-size: 16px; color: #0c4a6e;">Your verification code is:</p>
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 20px; border-radius: 12px; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 15px 0; display: inline-block; min-width: 200px;">
          ${otp}
        </div>
        <p style="margin: 15px 0 0 0; font-size: 14px; color: #dc2626; font-weight: 600;">
          ⏰ This code expires in 5 minutes
        </p>
      </div>
      <p style="margin: 15px 0 0 0; font-size: 14px; color: #0c4a6e;">
        <strong>Security Note:</strong> Never share this code with anyone. QuentBank staff will never ask for your verification code.
      </p>
    </div>
    
    <p class="text">
      <strong>How to use this code:</strong>
    </p>
    <ul style="color: #4b5563; margin-left: 20px; line-height: 1.8;">
      <li>Return to the QuentBank registration page</li>
      <li>Enter the 6-digit verification code exactly as shown above</li>
      <li>Click "Verify Email" to complete your registration</li>
      <li>You will then be able to access your account dashboard</li>
    </ul>
    
    <p class="text">
      If you did not create a QuentBank account, please ignore this email or contact our security team 
      at <strong>1-800-QUENT-1</strong> to report this incident.
    </p>
    
    <p class="text">
      <strong>Need help?</strong> Our customer support team is available 24/7 to assist you with account setup 
      and verification. You can reach us through our website, mobile app, or by calling the number above.
    </p>
  `;
  
  const actionButton = `
    <a href="${process.env.FRONTEND_URL || 'https://quentbank.com'}/verify-otp" class="button">
      🔐 Verify Your Email Address
    </a>
  `;
  
  const html = createEmailTemplate(
    'Email Verification Required', 
    content, 
    actionButton, 
    userName, 
    {}
  );
  
  const mailOptions = {
    from: `"QuentBank Account Verification" <${process.env.SMTP_USER}>`,
    to: userEmail,
    subject: 'Email Verification Required - QuentBank Account Setup',
    html: html,
    headers: {
      'X-Priority': '2',
      'X-MSMail-Priority': 'Normal',
      'Importance': 'normal'
    }
  };
  
  return await sendEmailWithRetry(mailOptions, 'Email verification OTP', userEmail);
};

// Login verification OTP
const sendLoginVerificationOTP = async (userEmail, userName, otp, loginDetails = {}) => {
  const content = `
    <p class="text">Dear ${userName},</p>
    
    <p class="text">
      We received a login attempt for your QuentBank account. As an additional security measure, 
      please verify this login using the verification code below.
    </p>
    
    <div style="background-color: #fef3c7; border: 1px solid #fbbf24; border-left: 5px solid #d97706; padding: 20px; margin: 25px 0; border-radius: 8px;">
      <h4 style="margin: 0 0 10px 0; color: #d97706; display: flex; align-items: center;">
        🔐 Login Verification Required
      </h4>
      <p style="margin: 0; font-size: 14px; color: #92400e;">
        Someone is trying to access your account. If this is you, use the code below to complete your login.
      </p>
    </div>
    
    <div class="highlight-box">
      <h3 class="highlight-title">Login Verification Code</h3>
      <div style="text-align: center; padding: 20px;">
        <p style="margin: 0 0 15px 0; font-size: 16px; color: #0c4a6e;">Enter this code to complete your login:</p>
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 20px; border-radius: 12px; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 15px 0; display: inline-block; min-width: 200px;">
          ${otp}
        </div>
        <p style="margin: 15px 0 0 0; font-size: 14px; color: #dc2626; font-weight: 600;">
          ⏰ This code expires in 5 minutes
        </p>
      </div>
      ${loginDetails.ipAddress || loginDetails.location ? `
      <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e0f2fe;">
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #0c4a6e; font-weight: 600;">Login Attempt Details:</p>
        ${loginDetails.ipAddress ? `<p style="margin: 5px 0; font-size: 13px; color: #4b5563;">IP Address: ${loginDetails.ipAddress}</p>` : ''}
        ${loginDetails.location ? `<p style="margin: 5px 0; font-size: 13px; color: #4b5563;">Location: ${loginDetails.location}</p>` : ''}
        <p style="margin: 5px 0; font-size: 13px; color: #4b5563;">Time: ${new Date().toLocaleString('en-US')}</p>
      </div>
      ` : ''}
    </div>
    
    <div style="background-color: #f0fdf4; border: 1px solid #86efac; border-left: 5px solid #16a34a; padding: 20px; margin: 25px 0; border-radius: 8px;">
      <h4 style="margin: 0 0 10px 0; color: #16a34a; display: flex; align-items: center;">
        ✅ If this login attempt was made by you:
      </h4>
      <p style="margin: 0; font-size: 14px; color: #15803d;">
        Simply enter the verification code above on the login page to access your account securely.
      </p>
    </div>
    
    <div style="background-color: #fef2f2; border: 1px solid #fca5a5; border-left: 5px solid #dc2626; padding: 20px; margin: 25px 0; border-radius: 8px;">
      <h4 style="margin: 0 0 10px 0; color: #dc2626; display: flex; align-items: center;">
        🚨 If you did NOT attempt to log in:
      </h4>
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #dc2626;">
        <strong>Your account may be at risk. Take immediate action:</strong>
      </p>
      <ul style="color: #dc2626; margin: 0; padding-left: 20px; font-size: 14px;">
        <li>Do not enter the verification code</li>
        <li>Change your password immediately</li>
        <li>Contact our security team at <strong>1-800-QUENT-1</strong></li>
        <li>Review your recent account activity</li>
      </ul>
    </div>
    
    <p class="text">
      <strong>Security Tips:</strong>
    </p>
    <ul style="color: #4b5563; margin-left: 20px; line-height: 1.8;">
      <li>Never share your verification codes with anyone</li>
      <li>QuentBank will never ask for codes via phone or email</li>
      <li>Always log in through our official website or mobile app</li>
      <li>Enable account alerts for enhanced security monitoring</li>
    </ul>
  `;
  
  const actionButton = `
    <a href="${process.env.FRONTEND_URL || 'https://quentbank.com'}/verify-login-otp" class="button">
      🔐 Complete Login Verification
    </a>
  `;
  
  const html = createEmailTemplate(
    'Login Verification Required', 
    content, 
    actionButton, 
    userName, 
    {}
  );
  
  const mailOptions = {
    from: `"QuentBank Security" <${process.env.SMTP_USER}>`,
    to: userEmail,
    subject: '🔐 Login Verification Required - QuentBank Security Alert',
    html: html,
    headers: {
      'X-Priority': '2',
      'X-MSMail-Priority': 'Normal',
      'Importance': 'normal'
    }
  };
  
  return await sendEmailWithRetry(mailOptions, 'Login verification OTP', userEmail);
};

module.exports = {
  sendAccountCreationEmail,
  sendTransferNotificationEmail,
  sendSecurityAlertEmail,
  sendEmailVerificationOTP,
  sendLoginVerificationOTP,
  createEmailTemplate
};
