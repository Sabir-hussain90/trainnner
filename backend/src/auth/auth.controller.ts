import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  // ============ LOGIN ============
  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.auth.login(body.email, body.password);
  }

  // ============ ME ============
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async me(@Request() req: any) {
    return this.auth.me(req.user.id);
  }

  // ============ USERS (list + create) ============
  @UseGuards(AuthGuard('jwt'))
  @Get('users')
  async listUsers(@Request() req: any) {
    return this.auth.listUsers(req.user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('users')
  async createUser(@Request() req: any, @Body() body: any) {
    return this.auth.createUser(req.user, body);
  }

  // ============ RESEND ACTIVATION ============
  @UseGuards(AuthGuard('jwt'))
  @Post('users/:id/resend-activation')
  async resendActivation(@Param('id') id: string, @Request() req: any) {
    return this.auth.resendActivation(id, req.user);
  }

  // ============ ACTIVATION ============
  @Get('verify-token')
  async verifyToken(@Query('token') token: string) {
    return this.auth.verifyActivationToken(token);
  }

  @Post('activate')
  async activate(
    @Body() body: { token: string; newPassword: string; confirmPassword?: string },
  ) {
    return this.auth.activate(body.token, body.newPassword, body.confirmPassword);
  }

  // ============ FORGOT PASSWORD ============
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.auth.forgotPassword(email);
  }

  // ============ RESET PASSWORD ============
  @Get('verify-reset-token')
  async verifyResetToken(@Query('token') token: string) {
    return this.auth.verifyResetToken(token);
  }

  @Post('reset-password')
  async resetPassword(
    @Body() body: { token: string; newPassword: string; confirmPassword?: string },
  ) {
    return this.auth.resetPassword(body.token, body.newPassword, body.confirmPassword);
  }
}