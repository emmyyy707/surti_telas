import { MODULE_MAP } from '@/shared/config/systemModules';

export const hasRequiredPermission = (userPermissions: string[] | undefined, required: string[]): boolean => {
  if (!userPermissions || userPermissions.length === 0) return false;
  return required.some((p) => userPermissions.includes(p));
};

export const hasModulePermission = (userPermissions: string[] | undefined, moduleKey: string): boolean => {
  if (!userPermissions || userPermissions.length === 0) return false;
  const mod = MODULE_MAP[moduleKey];
  if (!mod) return false;
  const permSet = new Set(userPermissions);
  return mod.permissionCodes.some((code) => permSet.has(code));
};