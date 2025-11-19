/**
 * Email Utility
 * Handles email sending using nodemailer
 */

import nodemailer from "nodemailer";
import { config } from "@/config/env.config";
import { logger } from "./logger";

/**
 * Create email transporter
 */
const createTransporter = () => {
  // If email credentials are not configured, return null
  if (!config.email.user || !config.email.password) {
    logger.warn("Email credentials not configured. Email sending disabled.");
    return null;
  }

  return nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.port === 465, // true for 465, false for other ports
    auth: {
      user: config.email.user,
      pass: config.email.password,
    },
  });
};

/**
 * Send email
 */
export const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      logger.warn(`Email not sent to ${to}: Email service not configured`);
      return false;
    }

    // Handle EMAIL_FROM format: "Display Name <email@example.com>" or just "email@example.com"
    const fromAddress = config.email.from.includes("<") 
      ? config.email.from 
      : `"GuestPost Now" <${config.email.from}>`;

    const mailOptions = {
      from: fromAddress,
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ""), // Plain text version
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.success(`Email sent successfully to ${to}: ${info.messageId}`);
    return true;
  } catch (error: any) {
    logger.error(`Failed to send email to ${to}:`, error);
    return false;
  }
};

/**
 * Send invoice email for fund request
 */
export const sendInvoiceEmail = async (fundRequest: {
  amount: number;
  paypalEmail?: string;
  userEmail: string;
  userName: string;
  requestDate: Date;
  id: string;
}): Promise<boolean> => {
  const recipientEmail = fundRequest.paypalEmail || fundRequest.userEmail;
  const formattedDate = new Date(fundRequest.requestDate).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  const subject = `Invoice for $${fundRequest.amount} - Fund Request`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice - Fund Request</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">GuestPost Now</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
        <h2 style="color: #667eea; margin-top: 0;">Invoice for Fund Request</h2>
        
        <p>Dear ${fundRequest.userName},</p>
        
        <p>Thank you for your fund request. Please find the invoice details below:</p>
        
        <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #667eea;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Request ID:</td>
              <td style="padding: 8px 0; text-align: right;">${fundRequest.id}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Amount:</td>
              <td style="padding: 8px 0; text-align: right; font-size: 18px; color: #667eea; font-weight: bold;">$${fundRequest.amount.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Request Date:</td>
              <td style="padding: 8px 0; text-align: right;">${formattedDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Payment Email:</td>
              <td style="padding: 8px 0; text-align: right;">${recipientEmail}</td>
            </tr>
          </table>
        </div>
        
        <div style="background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold; color: #856404;">📧 Payment Instructions:</p>
          <p style="margin: 10px 0 0 0; color: #856404;">
            Please send the payment of <strong>$${fundRequest.amount.toLocaleString()}</strong> to the PayPal email address: <strong>${recipientEmail}</strong>
          </p>
        </div>
        
        <p>Once payment is received, your account balance will be updated automatically.</p>
        
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
        
        <p style="margin-top: 30px;">
          Best regards,<br>
          <strong>GuestPost Now Team</strong>
        </p>
        
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
          This is an automated email. Please do not reply to this message.
        </p>
      </div>
    </body>
    </html>
  `;

  const text = `
Invoice for Fund Request

Dear ${fundRequest.userName},

Thank you for your fund request. Please find the invoice details below:

Request ID: ${fundRequest.id}
Amount: $${fundRequest.amount.toLocaleString()}
Request Date: ${formattedDate}
Payment Email: ${recipientEmail}

Payment Instructions:
Please send the payment of $${fundRequest.amount.toLocaleString()} to the PayPal email address: ${recipientEmail}

Once payment is received, your account balance will be updated automatically.

If you have any questions, please don't hesitate to contact our support team.

Best regards,
GuestPost Now Team
  `;

  return await sendEmail(recipientEmail, subject, html, text);
};

/**
 * Send order confirmation email (payment completed)
 */
export const sendOrderConfirmationEmail = async (order: {
  id: string;
  item_name: string;
  price: number;
  userName: string;
  userEmail: string;
  orderDate: Date;
  type?: string;
}): Promise<boolean> => {
  const formattedDate = new Date(order.orderDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const subject = `Order Confirmed - ${order.item_name}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmed</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">GuestPost Now</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
        <h2 style="color: #667eea; margin-top: 0;">✅ Payment Confirmed!</h2>
        
        <p>Dear ${order.userName},</p>
        
        <p>Thank you for your order! Your payment has been successfully processed.</p>
        
        <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Order ID:</td>
              <td style="padding: 8px 0; text-align: right;">${order.id}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Service:</td>
              <td style="padding: 8px 0; text-align: right;">${order.item_name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Order Type:</td>
              <td style="padding: 8px 0; text-align: right;">${order.type || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Amount Paid:</td>
              <td style="padding: 8px 0; text-align: right; font-size: 18px; color: #28a745; font-weight: bold;">$${order.price.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Order Date:</td>
              <td style="padding: 8px 0; text-align: right;">${formattedDate}</td>
            </tr>
          </table>
        </div>
        
        <div style="background: #d4edda; padding: 15px; border-radius: 5px; border-left: 4px solid #28a745; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold; color: #155724;">📦 Order Status: Processing</p>
          <p style="margin: 10px 0 0 0; color: #155724;">
            Your order is now being processed. We'll notify you once it's completed.
          </p>
        </div>
        
        <p>You can track your order status from your dashboard at any time.</p>
        
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
        
        <p style="margin-top: 30px;">
          Best regards,<br>
          <strong>GuestPost Now Team</strong>
        </p>
        
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
          This is an automated email. Please do not reply to this message.
        </p>
      </div>
    </body>
    </html>
  `;

  const text = `
Order Confirmed - Payment Successful

Dear ${order.userName},

Thank you for your order! Your payment has been successfully processed.

Order ID: ${order.id}
Service: ${order.item_name}
Order Type: ${order.type || "N/A"}
Amount Paid: $${order.price.toLocaleString()}
Order Date: ${formattedDate}

Order Status: Processing
Your order is now being processed. We'll notify you once it's completed.

You can track your order status from your dashboard at any time.

If you have any questions, please don't hesitate to contact our support team.

Best regards,
GuestPost Now Team
  `;

  return await sendEmail(order.userEmail, subject, html, text);
};

/**
 * Send order completion email
 */
export const sendOrderCompletionEmail = async (order: {
  id: string;
  item_name: string;
  price: number;
  userName: string;
  userEmail: string;
  orderDate: Date;
  completedAt: Date;
  completionMessage?: string;
  completionLink?: string;
  type?: string;
}): Promise<boolean> => {
  const formattedOrderDate = new Date(order.orderDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedCompletedDate = new Date(order.completedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const subject = `Order Completed - ${order.item_name}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Completed</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">GuestPost Now</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
        <h2 style="color: #28a745; margin-top: 0;">🎉 Order Completed!</h2>
        
        <p>Dear ${order.userName},</p>
        
        <p>Great news! Your order has been completed successfully.</p>
        
        <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Order ID:</td>
              <td style="padding: 8px 0; text-align: right;">${order.id}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Service:</td>
              <td style="padding: 8px 0; text-align: right;">${order.item_name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Order Type:</td>
              <td style="padding: 8px 0; text-align: right;">${order.type || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Amount Paid:</td>
              <td style="padding: 8px 0; text-align: right; font-size: 18px; color: #28a745; font-weight: bold;">$${order.price.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Order Date:</td>
              <td style="padding: 8px 0; text-align: right;">${formattedOrderDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Completed Date:</td>
              <td style="padding: 8px 0; text-align: right;">${formattedCompletedDate}</td>
            </tr>
          </table>
        </div>
        
        ${order.completionMessage ? `
        <div style="background: #d1ecf1; padding: 15px; border-radius: 5px; border-left: 4px solid #0c5460; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold; color: #0c5460;">📝 Completion Message:</p>
          <p style="margin: 10px 0 0 0; color: #0c5460;">${order.completionMessage}</p>
        </div>
        ` : ""}
        
        ${order.completionLink ? `
        <div style="text-align: center; margin: 30px 0;">
          <a href="${order.completionLink}" style="display: inline-block; background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Completed Work</a>
        </div>
        ` : ""}
        
        <div style="background: #d4edda; padding: 15px; border-radius: 5px; border-left: 4px solid #28a745; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold; color: #155724;">✅ Order Status: Completed</p>
          <p style="margin: 10px 0 0 0; color: #155724;">
            Your order has been successfully completed. Thank you for choosing GuestPost Now!
          </p>
        </div>
        
        <p>If you have any questions or need further assistance, please don't hesitate to contact our support team.</p>
        
        <p style="margin-top: 30px;">
          Best regards,<br>
          <strong>GuestPost Now Team</strong>
        </p>
        
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
          This is an automated email. Please do not reply to this message.
        </p>
      </div>
    </body>
    </html>
  `;

  const text = `
Order Completed

Dear ${order.userName},

Great news! Your order has been completed successfully.

Order ID: ${order.id}
Service: ${order.item_name}
Order Type: ${order.type || "N/A"}
Amount Paid: $${order.price.toLocaleString()}
Order Date: ${formattedOrderDate}
Completed Date: ${formattedCompletedDate}

${order.completionMessage ? `Completion Message: ${order.completionMessage}\n` : ""}
${order.completionLink ? `View Completed Work: ${order.completionLink}\n` : ""}

Order Status: Completed
Your order has been successfully completed. Thank you for choosing GuestPost Now!

If you have any questions or need further assistance, please don't hesitate to contact our support team.

Best regards,
GuestPost Now Team
  `;

  return await sendEmail(order.userEmail, subject, html, text);
};

/**
 * Send order status update email (for processing, failed, cancelled)
 */
export const sendOrderStatusUpdateEmail = async (order: {
  id: string;
  item_name: string;
  price: number;
  userName: string;
  userEmail: string;
  status: string;
  orderDate: Date;
  type?: string;
  message?: string;
}): Promise<boolean> => {
  const formattedDate = new Date(order.orderDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const statusConfig: { [key: string]: { color: string; icon: string; title: string; bgColor: string; textColor: string } } = {
    processing: {
      color: "#007bff",
      icon: "⚙️",
      title: "Order Processing",
      bgColor: "#cce5ff",
      textColor: "#004085",
    },
    failed: {
      color: "#dc3545",
      icon: "❌",
      title: "Order Failed",
      bgColor: "#f8d7da",
      textColor: "#721c24",
    },
    cancelled: {
      color: "#6c757d",
      icon: "🚫",
      title: "Order Cancelled",
      bgColor: "#e2e3e5",
      textColor: "#383d41",
    },
  };

  const config = statusConfig[order.status.toLowerCase()] || {
    color: "#6c757d",
    icon: "📋",
    title: "Order Status Updated",
    bgColor: "#e2e3e5",
    textColor: "#383d41",
  };

  const subject = `${config.title} - ${order.item_name}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Status Update</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, ${config.color} 0%, ${config.color}dd 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">GuestPost Now</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
        <h2 style="color: ${config.color}; margin-top: 0;">${config.icon} ${config.title}</h2>
        
        <p>Dear ${order.userName},</p>
        
        <p>Your order status has been updated.</p>
        
        <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid ${config.color};">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Order ID:</td>
              <td style="padding: 8px 0; text-align: right;">${order.id}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Service:</td>
              <td style="padding: 8px 0; text-align: right;">${order.item_name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Order Type:</td>
              <td style="padding: 8px 0; text-align: right;">${order.type || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Amount:</td>
              <td style="padding: 8px 0; text-align: right; font-size: 18px; color: ${config.color}; font-weight: bold;">$${order.price.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Order Date:</td>
              <td style="padding: 8px 0; text-align: right;">${formattedDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Status:</td>
              <td style="padding: 8px 0; text-align: right; font-weight: bold; color: ${config.color}; text-transform: capitalize;">${order.status}</td>
            </tr>
          </table>
        </div>
        
        ${order.message ? `
        <div style="background: ${config.bgColor}; padding: 15px; border-radius: 5px; border-left: 4px solid ${config.color}; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold; color: ${config.textColor};">📝 Message:</p>
          <p style="margin: 10px 0 0 0; color: ${config.textColor};">${order.message}</p>
        </div>
        ` : ""}
        
        <p>You can track your order status from your dashboard at any time.</p>
        
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
        
        <p style="margin-top: 30px;">
          Best regards,<br>
          <strong>GuestPost Now Team</strong>
        </p>
        
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
          This is an automated email. Please do not reply to this message.
        </p>
      </div>
    </body>
    </html>
  `;

  const text = `
${config.title}

Dear ${order.userName},

Your order status has been updated.

Order ID: ${order.id}
Service: ${order.item_name}
Order Type: ${order.type || "N/A"}
Amount: $${order.price.toLocaleString()}
Order Date: ${formattedDate}
Status: ${order.status}

${order.message ? `Message: ${order.message}\n` : ""}

You can track your order status from your dashboard at any time.

If you have any questions, please don't hesitate to contact our support team.

Best regards,
GuestPost Now Team
  `;

  return await sendEmail(order.userEmail, subject, html, text);
};

/**
 * Send email verification email
 */
export const sendVerificationEmail = async (user: {
  userEmail: string;
  userName: string;
  verificationToken: string;
  frontendUrl?: string;
}): Promise<boolean> => {
  const frontendUrl = user.frontendUrl || "http://localhost:3000";
  const verificationUrl = `${frontendUrl}/verify-email?token=${user.verificationToken}`;

  const subject = "Verify Your Email Address - GuestPost Now";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">GuestPost Now</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
        <h2 style="color: #667eea; margin-top: 0;">📧 Verify Your Email Address</h2>
        
        <p>Dear ${user.userName},</p>
        
        <p>Thank you for signing up with GuestPost Now! To complete your registration, please verify your email address by clicking the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Verify Email Address</a>
        </div>
        
        <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
        <p style="color: #667eea; font-size: 12px; word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 5px;">${verificationUrl}</p>
        
        <div style="background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold; color: #856404;">⏰ Important:</p>
          <p style="margin: 10px 0 0 0; color: #856404;">
            This verification link will expire in 24 hours. If you didn't create an account with GuestPost Now, please ignore this email.
          </p>
        </div>
        
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
        
        <p style="margin-top: 30px;">
          Best regards,<br>
          <strong>GuestPost Now Team</strong>
        </p>
        
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
          This is an automated email. Please do not reply to this message.
        </p>
      </div>
    </body>
    </html>
  `;

  const text = `
Verify Your Email Address - GuestPost Now

Dear ${user.userName},

Thank you for signing up with GuestPost Now! To complete your registration, please verify your email address by clicking the link below:

${verificationUrl}

Important: This verification link will expire in 24 hours. If you didn't create an account with GuestPost Now, please ignore this email.

If you have any questions, please don't hesitate to contact our support team.

Best regards,
GuestPost Now Team
  `;

  return await sendEmail(user.userEmail, subject, html, text);
};

/**
 * Send site submission approval email
 */
export const sendSiteSubmissionApprovalEmail = async (data: {
  userEmail: string;
  userName: string;
  websites: string[];
  frontendUrl?: string;
  adminNotes?: string;
}): Promise<boolean> => {
  const frontendUrl = data.frontendUrl || "http://localhost:3000";
  const websitesList = data.websites.map((website) => `• ${website}`).join("<br>");

  const subject = "🎉 Your Site Submission Has Been Approved - GuestPost Now";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Site Submission Approved</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">✅ Site Submission Approved</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
        <h2 style="color: #10b981; margin-top: 0;">Congratulations, ${data.userName}!</h2>
        
        <p>We're excited to inform you that your site submission has been <strong>approved</strong>!</p>
        
        <div style="background: #d1fae5; padding: 20px; border-radius: 5px; border-left: 4px solid #10b981; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold; color: #065f46;">📋 Approved Websites:</p>
          <div style="margin-top: 10px; color: #047857;">
            ${websitesList}
          </div>
        </div>
        
        ${data.adminNotes ? `
        <div style="background: #fef3c7; padding: 15px; border-radius: 5px; border-left: 4px solid #f59e0b; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold; color: #92400e;">📝 Admin Notes:</p>
          <p style="margin: 10px 0 0 0; color: #78350f;">${data.adminNotes}</p>
        </div>
        ` : ''}
        
        <p>Your websites are now live on our platform and available for guest post opportunities. You can start receiving orders and growing your business!</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${frontendUrl}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">View Dashboard</a>
        </div>
        
        <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
        
        <p style="margin-top: 30px;">
          Best regards,<br>
          <strong>GuestPost Now Team</strong>
        </p>
        
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
          This is an automated email. Please do not reply to this message.
        </p>
      </div>
    </body>
    </html>
  `;

  const text = `
Site Submission Approved - GuestPost Now

Congratulations, ${data.userName}!

We're excited to inform you that your site submission has been approved!

Approved Websites:
${data.websites.map((website) => `• ${website}`).join("\n")}

${data.adminNotes ? `Admin Notes: ${data.adminNotes}\n\n` : ''}
Your websites are now live on our platform and available for guest post opportunities. You can start receiving orders and growing your business!

Visit your dashboard: ${frontendUrl}/dashboard

If you have any questions or need assistance, please don't hesitate to contact our support team.

Best regards,
GuestPost Now Team
  `;

  return await sendEmail(data.userEmail, subject, html, text);
};

/**
 * Send site submission rejection email
 */
export const sendSiteSubmissionRejectionEmail = async (data: {
  userEmail: string;
  userName: string;
  websites: string[];
  frontendUrl?: string;
  adminNotes?: string;
}): Promise<boolean> => {
  const frontendUrl = data.frontendUrl || "http://localhost:3000";
  const websitesList = data.websites.map((website) => `• ${website}`).join("<br>");

  const subject = "Site Submission Status Update - GuestPost Now";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Site Submission Status</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">Site Submission Status Update</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
        <h2 style="color: #ef4444; margin-top: 0;">Dear ${data.userName},</h2>
        
        <p>We regret to inform you that your site submission has been <strong>rejected</strong>.</p>
        
        <div style="background: #fee2e2; padding: 20px; border-radius: 5px; border-left: 4px solid #ef4444; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold; color: #991b1b;">📋 Submitted Websites:</p>
          <div style="margin-top: 10px; color: #7f1d1d;">
            ${websitesList}
          </div>
        </div>
        
        ${data.adminNotes ? `
        <div style="background: #fef3c7; padding: 15px; border-radius: 5px; border-left: 4px solid #f59e0b; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold; color: #92400e;">📝 Reason for Rejection:</p>
          <p style="margin: 10px 0 0 0; color: #78350f;">${data.adminNotes}</p>
        </div>
        ` : `
        <div style="background: #fef3c7; padding: 15px; border-radius: 5px; border-left: 4px solid #f59e0b; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold; color: #92400e;">📝 Note:</p>
          <p style="margin: 10px 0 0 0; color: #78350f;">Your submission did not meet our current quality standards. Please review our guidelines and feel free to submit again after making the necessary improvements.</p>
        </div>
        `}
        
        <p>We encourage you to review our submission guidelines and resubmit your websites after addressing the concerns mentioned above.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${frontendUrl}/list-your-site" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Submit Again</a>
        </div>
        
        <p>If you have any questions or need clarification, please don't hesitate to contact our support team. We're here to help!</p>
        
        <p style="margin-top: 30px;">
          Best regards,<br>
          <strong>GuestPost Now Team</strong>
        </p>
        
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
          This is an automated email. Please do not reply to this message.
        </p>
      </div>
    </body>
    </html>
  `;

  const text = `
Site Submission Status Update - GuestPost Now

Dear ${data.userName},

We regret to inform you that your site submission has been rejected.

Submitted Websites:
${data.websites.map((website) => `• ${website}`).join("\n")}

${data.adminNotes ? `Reason for Rejection: ${data.adminNotes}\n\n` : 'Note: Your submission did not meet our current quality standards. Please review our guidelines and feel free to submit again after making the necessary improvements.\n\n'}
We encourage you to review our submission guidelines and resubmit your websites after addressing the concerns mentioned above.

Submit again: ${frontendUrl}/list-your-site

If you have any questions or need clarification, please don't hesitate to contact our support team. We're here to help!

Best regards,
GuestPost Now Team
  `;

  return await sendEmail(data.userEmail, subject, html, text);
};

/**
 * Send site submission received email
 */
export const sendSiteSubmissionReceivedEmail = async (data: {
  userEmail: string;
  userName: string;
  websites: string[];
  frontendUrl?: string;
}): Promise<boolean> => {
  const frontendUrl = data.frontendUrl || "http://localhost:3000";
  const websitesList = data.websites.map((website) => `• ${website}`).join("<br>");

  const subject = "Site Submission Received - GuestPost Now";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Site Submission Received</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">📨 Site Submission Received</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
        <h2 style="color: #3b82f6; margin-top: 0;">Thank you, ${data.userName}!</h2>
        
        <p>We've successfully received your site submission and our team is currently reviewing it.</p>
        
        <div style="background: #dbeafe; padding: 20px; border-radius: 5px; border-left: 4px solid #3b82f6; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold; color: #1e40af;">📋 Submitted Websites:</p>
          <div style="margin-top: 10px; color: #1e3a8a;">
            ${websitesList}
          </div>
        </div>
        
        <div style="background: #fef3c7; padding: 15px; border-radius: 5px; border-left: 4px solid #f59e0b; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold; color: #92400e;">⏰ What's Next?</p>
          <p style="margin: 10px 0 0 0; color: #78350f;">
            Our review team will carefully evaluate your submission. You'll receive an email notification once the review is complete, typically within 24-48 hours.
          </p>
        </div>
        
        <p>In the meantime, you can check the status of your submission in your dashboard.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${frontendUrl}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">View Dashboard</a>
        </div>
        
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
        
        <p style="margin-top: 30px;">
          Best regards,<br>
          <strong>GuestPost Now Team</strong>
        </p>
        
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
          This is an automated email. Please do not reply to this message.
        </p>
      </div>
    </body>
    </html>
  `;

  const text = `
Site Submission Received - GuestPost Now

Thank you, ${data.userName}!

We've successfully received your site submission and our team is currently reviewing it.

Submitted Websites:
${data.websites.map((website) => `• ${website}`).join("\n")}

What's Next?
Our review team will carefully evaluate your submission. You'll receive an email notification once the review is complete, typically within 24-48 hours.

In the meantime, you can check the status of your submission in your dashboard.

Visit your dashboard: ${frontendUrl}/dashboard

If you have any questions, please don't hesitate to contact our support team.

Best regards,
GuestPost Now Team
  `;

  return await sendEmail(data.userEmail, subject, html, text);
};
