import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from './email.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private emailService: EmailService,
  ) {}

  // ============ PASSWORD VALIDATION HELPER ============
  private validatePassword(password: string) {
    if (!password || password.length !== 10) {
      throw new BadRequestException('Password must be exactly 10 characters long.');
    }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      throw new BadRequestException('Password must be a mix of letters and numbers.');
    }
    if (!/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/;'`~]/.test(password)) {
      throw new BadRequestException('Password must include at least one special character.');
    }
  }

  // ============ LOGIN ============
  async login(email: string, password: string) {
    if (!email?.trim() || !password) {
      throw new BadRequestException('Email and password are required.');
    }

    const normalizedEmail = email.trim().toLowerCase();

    // =========================================================
    // 1. CHECK ENV SUPER ADMIN
    // =========================================================
    const envAdminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const envAdminPassword = process.env.ADMIN_PASSWORD;

    if (envAdminEmail && envAdminPassword && normalizedEmail === envAdminEmail) {
      if (password !== envAdminPassword) {
        throw new UnauthorizedException('Invalid email or password.');
      }

      // Find or Create the Admin in the REAL database
      let adminUser = await this.prisma.user.findUnique({
        where: { email: envAdminEmail },
      });

      if (!adminUser) {
        const hashed = await bcrypt.hash(envAdminPassword, 10);
        adminUser = await this.prisma.user.create({
          data: {
            email: envAdminEmail,
            password: hashed,
            firstName: 'Super',
            lastName: 'Admin',
            role: 'ADMIN',
            status: 'ACTIVE',
            activatedAt: new Date(),
          },
        });
        console.log('✅ Created Super Admin in PostgreSQL successfully.');
      }

      // Generate REAL token using the DB ID
      const token = this.jwt.sign({
        sub: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
      });

      const { password: _, ...safeUser } = adminUser;
      return { user: safeUser, token };
    }

    // =========================================================
    // 2. REGULAR DATABASE LOGIN (For normal users)
    // =========================================================
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) throw new UnauthorizedException('Invalid email or password.');

    if (user.status === 'PENDING' || !user.activatedAt) {
      throw new UnauthorizedException(
        'Your account is not activated yet. Please check your email for the activation link.',
      );
    }

    if (user.status === 'SUSPENDED') {
      throw new UnauthorizedException('Your account is suspended.');
    }

    if (user.status === 'INACTIVE') {
      throw new UnauthorizedException('Your account is inactive.');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid email or password.');

    const token = this.jwt.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const { password: _, ...safeUser } = user;

    return { user: safeUser, token };
  }

  // ============ ME ============
  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        phone: true,
        profilePhoto: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // ============ CREATE USER ============
  async createUser(
    inviter: { id?: string; firstName?: string; lastName?: string; email?: string; role?: string },
    body: {
      firstName: string;
      lastName: string;
      email: string;
      role?: string;
      phone?: string;
      profilePhoto?: string;
    },
  ) {
    const { firstName, lastName, email, role = 'STAFF', phone, profilePhoto } = body || {};

    if (!firstName?.trim()) throw new BadRequestException('firstName is required');
    if (!lastName?.trim()) throw new BadRequestException('lastName is required');
    if (!email?.trim()) throw new BadRequestException('email is required');

    // Role-based creation rules
    const inviterRole = inviter?.role;
    const targetRole = role.toUpperCase();

    if (inviterRole === 'SUPERVISOR' && targetRole !== 'STAFF') {
      throw new BadRequestException('Supervisors can only create STAFF users.');
    }
    if (inviterRole === 'STAFF') {
      throw new UnauthorizedException('Staff cannot create users.');
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) throw new ConflictException('Email already in use');

    const activationToken = randomBytes(32).toString('hex');
    const activationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const placeholderPassword = randomBytes(32).toString('hex');
    const hashedPlaceholder = await bcrypt.hash(placeholderPassword, 10);

    const newUser = await this.prisma.user.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: normalizedEmail,
        password: hashedPlaceholder,
        role: targetRole as any,
        phone: phone?.trim() || null,
        profilePhoto: profilePhoto || null,
        status: 'PENDING',
        activationToken,
        activationExpires,
        activatedAt: null,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        phone: true,
        profilePhoto: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const invitedByName =
      `${inviter?.firstName || ''} ${inviter?.lastName || ''}`.trim() ||
      inviter?.email ||
      'Super Admin';

    try {
      await this.emailService.sendActivationEmail({
        to: newUser.email,
        firstName: newUser.firstName,
        role: newUser.role as any,
        token: activationToken,
        invitedByName,
      });
      console.log(`✅ Activation email sent to ${newUser.email}`);
    } catch (err: any) {
      console.error(`❌ Activation email FAILED for ${newUser.email}:`, err?.message || err);
    }

    return newUser;
  }

  // ============ LIST USERS (ROLE-FILTERED) ============
  async listUsers(requester: { id: string; role: string }) {
    const role = requester?.role;

    let where: any = {};

    if (role === 'ADMIN') {
      where = {};
    } else if (role === 'SUPERVISOR') {
      where = { role: 'STAFF' };
    } else {
      return [];
    }

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        phone: true,
        profilePhoto: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ============ RESEND ACTIVATION ============
  async resendActivation(userId: string, requester?: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('User not found');
    if (user.activatedAt) {
      throw new BadRequestException('This user is already activated.');
    }

    const activationToken = randomBytes(32).toString('hex');
    const activationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: userId },
      data: { activationToken, activationExpires },
    });

    const invitedByName =
      `${requester?.firstName || ''} ${requester?.lastName || ''}`.trim() ||
      requester?.email ||
      'Super Admin';

    try {
      await this.emailService.sendActivationEmail({
        to: user.email,
        firstName: user.firstName,
        role: user.role as any,
        token: activationToken,
        invitedByName,
      });
      console.log(`✅ Activation email resent to ${user.email}`);
    } catch (err: any) {
      console.error(`❌ Activation email resend FAILED for ${user.email}:`, err?.message || err);
      throw new BadRequestException(`Failed to send email: ${err?.message || err}`);
    }

    return { success: true, message: 'Activation email resent.' };
  }

  // ============ ACTIVATE ============
  async activate(token: string, newPassword: string, confirmPassword?: string) {
    if (confirmPassword !== undefined && confirmPassword !== newPassword) {
      throw new BadRequestException('Passwords do not match.');
    }
    if (!token) throw new BadRequestException('Token is required.');
    
    // Use the new validation helper
    this.validatePassword(newPassword);

    const user = await this.prisma.user.findFirst({
      where: { activationToken: token },
    });
    if (!user) throw new BadRequestException('Invalid activation link.');
    if (user.activatedAt) throw new BadRequestException('This account has already been activated.');
    if (user.activationExpires && user.activationExpires < new Date()) {
      throw new BadRequestException('This activation link has expired.');
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    return this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        activationToken: null,
        activationExpires: null,
        activatedAt: new Date(),
        status: 'ACTIVE',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        activatedAt: true,
      },
    });
  }

  // ============ VERIFY ACTIVATION TOKEN ============
  async verifyActivationToken(token: string) {
    if (!token) return { valid: false, message: 'No token provided.' };

    const user = await this.prisma.user.findFirst({
      where: { activationToken: token },
    });
    if (!user) return { valid: false, message: 'Invalid activation link.' };
    if (user.activatedAt) return { valid: false, message: 'This account has already been activated.' };
    if (user.activationExpires && user.activationExpires < new Date()) {
      return { valid: false, message: 'This activation link has expired.' };
    }

    return { valid: true, email: user.email, firstName: user.firstName };
  }

  // ============ FORGOT PASSWORD ============
  async forgotPassword(email: string) {
    if (!email?.trim()) throw new BadRequestException('Email is required.');

    const user = await this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      return { success: true, message: 'If the email exists, a reset link has been sent.' };
    }

    const resetToken = randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetExpires },
    });

    try {
      await this.emailService.sendPasswordResetEmail({
        to: user.email,
        firstName: user.firstName,
        token: resetToken,
      });
      console.log(`✅ Password reset email sent to ${user.email}`);
    } catch (err: any) {
      console.error(`❌ Password reset email FAILED for ${user.email}:`, err?.message || err);
      throw new BadRequestException(
        `Failed to send reset email: ${err?.message || 'Unknown error'}`,
      );
    }

    return { success: true, message: 'If the email exists, a reset link has been sent.' };
  }

  // ============ VERIFY RESET TOKEN ============
  async verifyResetToken(token: string) {
    if (!token) return { valid: false, message: 'No token provided.' };

    const user = await this.prisma.user.findFirst({ where: { resetToken: token } });
    if (!user) return { valid: false, message: 'Invalid reset link.' };
    if (user.resetExpires && user.resetExpires < new Date()) {
      return { valid: false, message: 'Reset link has expired.' };
    }

    return { valid: true, email: user.email, firstName: user.firstName };
  }

  // ============ RESET PASSWORD ============
  async resetPassword(token: string, newPassword: string, confirmPassword?: string) {
    if (confirmPassword !== undefined && confirmPassword !== newPassword) {
      throw new BadRequestException('Passwords do not match.');
    }
    if (!token) throw new BadRequestException('Token is required.');
    
    // Use the new validation helper
    this.validatePassword(newPassword);

    const user = await this.prisma.user.findFirst({ where: { resetToken: token } });
    if (!user) throw new BadRequestException('Invalid reset link.');
    if (user.resetExpires && user.resetExpires < new Date()) {
      throw new BadRequestException('Reset link has expired.');
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, resetToken: null, resetExpires: null },
    });

    try {
      await this.emailService.sendPasswordResetSuccessEmail({
        to: user.email,
        firstName: user.firstName,
      });
      console.log(`✅ Password reset confirmation email sent to ${user.email}`);
    } catch (err: any) {
      console.error(`❌ Confirmation email FAILED for ${user.email}:`, err?.message || err);
    }

    return { success: true, message: 'Password reset successfully.' };
  }
}