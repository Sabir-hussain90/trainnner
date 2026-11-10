import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    const host = process.env.MAIL_HOST || 'smtp.gmail.com';
    const port = Number(process.env.MAIL_PORT || 587);
    const user = process.env.MAIL_USER;
    const pass = process.env.MAIL_PASSWORD;

    if (!user || !pass) {
      this.logger.error('❌ Gmail SMTP config missing. Check MAIL_USER and MAIL_PASSWORD in .env');
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
    });

    this.transporter.verify((err) => {
      if (err) {
        this.logger.error(`❌ Gmail SMTP verify FAILED: ${err.message}`);
      } else {
        this.logger.log('✅ Gmail SMTP ready — connection verified');
      }
    });
  }

  // ============ ACTIVATION EMAIL ============
  async sendActivationEmail(params: {
    to: string;
    firstName: string;
    role: string;
    token: string;
    invitedByName: string;
  }) {
    const activationBase = process.env.ACTIVATION_URL || 'http://localhost:3000/activate';
    const activationLink = `${activationBase}?token=${params.token}`;

    this.logger.log(`📧 Sending activation email to ${params.to}`);
    this.logger.log(`🔗 Activation link: ${activationLink}`);

    const text = `Hello ${params.firstName},

You have been invited by ${params.invitedByName} to join TrainerMatrix as a ${params.role}.

Activate your account here:
${activationLink}

This link expires in 24 hours.

— TrainerMatrix Team`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a73e8;">Welcome to TrainerMatrix</h2>
        <p>Hi <strong>${params.firstName}</strong>,</p>
        <p>You have been invited by <strong>${params.invitedByName}</strong> as a <strong>${params.role}</strong>.</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${activationLink}" style="background: #1a73e8; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Activate Account
          </a>
        </p>
        <p style="color: #666; font-size: 13px;">Or copy: <a href="${activationLink}">${activationLink}</a></p>
        <p style="color: #666; font-size: 13px;">This link expires in 24 hours.</p>
      </div>
    `;

    try {
      const info = await this.transporter.sendMail({
        from: process.env.MAIL_FROM || '"TrainerMatrix" <sabir2014852@gmail.com>',
        to: params.to,
        subject: 'Your TrainerMatrix account is ready',
        text,
        html,
      });
      this.logger.log(`✉️ Activation email SENT — MessageId: ${info.messageId}`);
      return info;
    } catch (err: any) {
      this.logger.error(`❌ Activation email FAILED to ${params.to}: ${err?.message || err}`);
      throw err;
    }
  }

  // ============ PASSWORD RESET EMAIL ============
  async sendPasswordResetEmail(params: {
    to: string;
    firstName: string;
    token: string;
  }) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${params.token}`;

    this.logger.log(`📧 Sending password reset email to ${params.to}`);
    this.logger.log(`🔗 Reset link: ${resetUrl}`);

    const text = `Hi ${params.firstName},

You requested a password reset for your TrainerMatrix account.

Reset your password here:
${resetUrl}

This link expires in 1 hour.

If you did not request this, ignore this email.

— TrainerMatrix Team`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a73e8;">Reset your password</h2>
        <p>Hi <strong>${params.firstName}</strong>,</p>
        <p>You requested a password reset for your TrainerMatrix account.</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #1a73e8; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p style="color: #666; font-size: 13px;">Or copy: <a href="${resetUrl}">${resetUrl}</a></p>
        <p style="color: #666; font-size: 13px;">This link expires in 1 hour.</p>
      </div>
    `;

    try {
      const info = await this.transporter.sendMail({
        from: process.env.MAIL_FROM || '"TrainerMatrix" <sabir2014852@gmail.com>',
        to: params.to,
        subject: 'Reset your TrainerMatrix password',
        text,
        html,
      });
      this.logger.log(`✉️ Password reset email SENT — MessageId: ${info.messageId}`);
      return info;
    } catch (err: any) {
      this.logger.error(`❌ Password reset email FAILED to ${params.to}: ${err?.message || err}`);
      throw err;
    }
  }

  // ============ PASSWORD RESET SUCCESS CONFIRMATION EMAIL ============
  async sendPasswordResetSuccessEmail(params: {
    to: string;
    firstName: string;
  }) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    this.logger.log(`📧 Sending password reset confirmation to ${params.to}`);

    const text = `Hi ${params.firstName},

Your TrainerMatrix password was successfully reset.

You can now log in with your new password:
${frontendUrl}/

If you did NOT request this change, please contact support immediately.

— TrainerMatrix Team`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a73e8;">Password Reset Successful</h2>
        <p>Hi <strong>${params.firstName}</strong>,</p>
        <p>Your <strong>TrainerMatrix password was successfully reset</strong>.</p>
        <p>You can now log in with your new password:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${frontendUrl}/" style="background: #1a73e8; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Log In to TrainerMatrix
          </a>
        </p>
        <p style="color: #666; font-size: 13px;">Or copy: <a href="${frontendUrl}/">${frontendUrl}/</a></p>
        <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; margin: 24px 0; border-radius: 4px;">
          <p style="color: #991b1b; font-size: 13px; margin: 0;">
            <strong>⚠️ Didn't request this?</strong><br/>
            If you did NOT request a password reset, someone may have access to your email. Please contact support immediately.
          </p>
        </div>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">— TrainerMatrix Team</p>
      </div>
    `;

    try {
      const info = await this.transporter.sendMail({
        from: process.env.MAIL_FROM || '"TrainerMatrix" <sabir2014852@gmail.com>',
        to: params.to,
        subject: 'Your TrainerMatrix password was reset',
        text,
        html,
      });
      this.logger.log(`✉️ Password reset confirmation SENT — MessageId: ${info.messageId}`);
      return info;
    } catch (err: any) {
      this.logger.error(`❌ Password reset confirmation FAILED to ${params.to}: ${err?.message || err}`);
      throw err;
    }
  }
}