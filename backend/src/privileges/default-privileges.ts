export const PRIVILEGE_KEYS = [
  'create_profiles',
  'activate_profiles',
  'archive_profiles',
  'delete_profiles',
  'grant_client_access',
  'create_programs',
  'delete_programs',
  'create_workouts',
  'delete_workouts',
  'create_exercises',
  'delete_exercises',
  'create_forms',
  'delete_forms',
] as const;

export type PrivilegeKey = (typeof PRIVILEGE_KEYS)[number];
export type RoleKey = 'admin' | 'supervisor' | 'staff';
export type PrivilegeMatrix = Record<PrivilegeKey, Record<RoleKey, boolean>>;

export function defaultPrivileges(): PrivilegeMatrix {
  const m = {} as PrivilegeMatrix;
  for (const key of PRIVILEGE_KEYS) {
    m[key] = { admin: true, supervisor: true, staff: true };
  }
  return m;
}

export function sanitizePrivileges(input: any): PrivilegeMatrix {
  const base = defaultPrivileges();
  if (!input || typeof input !== 'object') return base;
  for (const key of PRIVILEGE_KEYS) {
    const row = input[key];
    if (row && typeof row === 'object') {
      base[key].admin = row.admin === true;
      base[key].supervisor = row.supervisor === true;
      base[key].staff = row.staff === true;
    }
  }
  return base;
}