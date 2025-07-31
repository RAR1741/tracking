import { database } from "./context";
import { permission, role, rolePermission } from "./schema";

// Define permissions
export const PERMISSIONS = {
  // User management
  USER_CREATE: "user:create",
  USER_READ: "user:read",
  USER_UPDATE: "user:update",
  USER_DELETE: "user:delete",
  USER_ASSIGN_ROLES: "user:assign_roles",
  USER_ASSIGN_PERMISSIONS: "user:assign_permissions",

  // Role management
  ROLE_CREATE: "role:create",
  ROLE_READ: "role:read",
  ROLE_UPDATE: "role:update",
  ROLE_DELETE: "role:delete",

  // Permission management
  PERMISSION_CREATE: "permission:create",
  PERMISSION_READ: "permission:read",
  PERMISSION_UPDATE: "permission:update",
  PERMISSION_DELETE: "permission:delete",

  // Content management
  CONTENT_CREATE: "content:create",
  CONTENT_READ: "content:read",
  CONTENT_UPDATE: "content:update",
  CONTENT_DELETE: "content:delete",

  // Student specific
  STUDENT_PROGRESS_VIEW: "student:progress_view",
  STUDENT_PROGRESS_UPDATE: "student:progress_update",

  // Parent specific
  CHILD_PROGRESS_VIEW: "child:progress_view",

  // System
  SYSTEM_ADMIN: "system:admin",
} as const;

// Define roles with their permissions
export const ROLES = {
  ADMIN: {
    id: "admin",
    name: "ADMIN",
    description: "Full system administrator with all permissions",
    permissions: Object.values(PERMISSIONS),
  },
  MENTOR: {
    id: "mentor",
    name: "MENTOR",
    description: "Mentor who can manage students and content",
    permissions: [
      PERMISSIONS.USER_READ,
      PERMISSIONS.USER_UPDATE,
      PERMISSIONS.CONTENT_CREATE,
      PERMISSIONS.CONTENT_READ,
      PERMISSIONS.CONTENT_UPDATE,
      PERMISSIONS.STUDENT_PROGRESS_VIEW,
      PERMISSIONS.STUDENT_PROGRESS_UPDATE,
    ],
  },
  STUDENT_ADMIN: {
    id: "student_admin",
    name: "STUDENT_ADMIN",
    description: "Student administrator with elevated permissions",
    permissions: [
      PERMISSIONS.USER_READ,
      PERMISSIONS.CONTENT_READ,
      PERMISSIONS.CONTENT_CREATE,
      PERMISSIONS.STUDENT_PROGRESS_VIEW,
    ],
  },
  STUDENT: {
    id: "student",
    name: "STUDENT",
    description: "Regular student with basic access",
    permissions: [PERMISSIONS.CONTENT_READ, PERMISSIONS.STUDENT_PROGRESS_VIEW],
  },
  PARENT: {
    id: "parent",
    name: "PARENT",
    description: "Parent who can view their child's progress",
    permissions: [PERMISSIONS.CHILD_PROGRESS_VIEW],
  },
  GUEST: {
    id: "guest",
    name: "GUEST",
    description: "Guest user with minimal access",
    permissions: [PERMISSIONS.CONTENT_READ],
  },
} as const;

export async function seedRolesAndPermissions() {
  try {
    const db = database();

    // Insert permissions
    const permissionsList = Object.values(PERMISSIONS).map((perm) => ({
      id: perm,
      name: perm,
      description: `Permission to ${perm.replace(":", " ")}`,
    }));

    for (const perm of permissionsList) {
      await db.insert(permission).values(perm).onConflictDoNothing();
    }

    // Insert roles
    for (const roleConfig of Object.values(ROLES)) {
      await db
        .insert(role)
        .values({
          id: roleConfig.id,
          name: roleConfig.name,
          description: roleConfig.description,
        })
        .onConflictDoNothing();

      // Insert role permissions
      for (const permissionName of roleConfig.permissions) {
        await db
          .insert(rolePermission)
          .values({
            roleId: roleConfig.id,
            permissionId: permissionName,
          })
          .onConflictDoNothing();
      }
    }

    return {
      success: true,
      message: "Roles and permissions seeded successfully",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
