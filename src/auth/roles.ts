import { USER_ROLE, type TUserRole } from '@/types/user';

/** Every backend role except a regular customer account may use the dashboard. */
export const ADMIN_ROLES: readonly TUserRole[] = Object.values(
    USER_ROLE
).filter((role) => role !== USER_ROLE.USER);

export const isAdminRole = (role?: string | null): boolean =>
    !!role && (ADMIN_ROLES as readonly string[]).includes(role);
