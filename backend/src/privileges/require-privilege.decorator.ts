import { SetMetadata } from '@nestjs/common';
import { PrivilegeKey } from './default-privileges';

export const PRIVILEGE_KEY = 'required_privilege';
export const RequirePrivilege = (key: PrivilegeKey) =>
  SetMetadata(PRIVILEGE_KEY, key);