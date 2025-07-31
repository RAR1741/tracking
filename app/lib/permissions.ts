import { PERMISSIONS } from "../../database/seed";
import {
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
} from "./user-permissions";

export interface AuthContext {
  userId?: string;
  isAuthenticated: boolean;
}

export function createPermissionChecker(authContext: AuthContext) {
  return {
    can: async (permission: string) => {
      if (!authContext.isAuthenticated || !authContext.userId) {
        return false;
      }
      return await hasPermission(authContext.userId, permission);
    },

    canAny: async (permissions: string[]) => {
      if (!authContext.isAuthenticated || !authContext.userId) {
        return false;
      }
      return await hasAnyPermission(authContext.userId, permissions);
    },

    canAll: async (permissions: string[]) => {
      if (!authContext.isAuthenticated || !authContext.userId) {
        return false;
      }
      return await hasAllPermissions(authContext.userId, permissions);
    },

    // Helper methods for common permission checks
    canManageUsers: async () => {
      if (!authContext.isAuthenticated || !authContext.userId) {
        return false;
      }
      return await hasAnyPermission(authContext.userId, [
        PERMISSIONS.USER_UPDATE,
        PERMISSIONS.USER_ASSIGN_ROLES,
        PERMISSIONS.USER_ASSIGN_PERMISSIONS,
      ]);
    },

    canCreateContent: async () => {
      if (!authContext.isAuthenticated || !authContext.userId) {
        return false;
      }
      return await hasPermission(
        authContext.userId,
        PERMISSIONS.CONTENT_CREATE
      );
    },

    isAdmin: async () => {
      if (!authContext.isAuthenticated || !authContext.userId) {
        return false;
      }
      return await hasPermission(authContext.userId, PERMISSIONS.SYSTEM_ADMIN);
    },
  };
}

// React hook-like utility for permissions in components
export interface UsePermissionsReturn {
  // eslint-disable-next-line no-unused-vars
  can: (permission: string) => Promise<boolean>;
  // eslint-disable-next-line no-unused-vars
  canAny: (permissions: string[]) => Promise<boolean>;
  // eslint-disable-next-line no-unused-vars
  canAll: (permissions: string[]) => Promise<boolean>;
  canManageUsers: () => Promise<boolean>;
  canCreateContent: () => Promise<boolean>;
  isAdmin: () => Promise<boolean>;
}

export function usePermissions(authContext: AuthContext): UsePermissionsReturn {
  return createPermissionChecker(authContext);
}
