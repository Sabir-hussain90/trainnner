import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrivilegesService } from './privileges.service';
import { PRIVILEGE_KEY } from './require-privilege.decorator';
import { PrivilegeKey } from './default-privileges';

@Injectable()
export class PrivilegesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private privileges: PrivilegesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<PrivilegeKey | undefined>(
      PRIVILEGE_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required) return true;

    const req = context.switchToHttp().getRequest();
    const role = req.user?.role;
    const allowed = await this.privileges.assert(role, required);

    if (!allowed) {
      throw new ForbiddenException(
        `Your role (${role || 'unknown'}) does not have the "${required}" privilege.`,
      );
    }
    return true;
  }
}