import { eq } from "drizzle-orm";
import { database } from "./context";
import { permission, role, rolePermission, user } from "./schema";

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

export async function seedLocalAdmin() {
  if (process.env.NODE_ENV !== "development") {
    return {
      success: false,
      error: "LOCAL_ADMIN can only be created in development mode",
    };
  }

  try {
    // Admin credentials for development
    const adminEmail = "admin@example.com";
    const adminPassword = "admin123456";
    const adminName = "Local Admin";

    // Check if admin user already exists
    const db = database();
    const existingUser = await db.query.user.findFirst({
      where: (user, { eq }) => eq(user.email, adminEmail),
    });

    if (existingUser) {
      // User exists, just ensure they have admin role in the database
      await db
        .update(user)
        .set({ role: "admin" })
        .where(eq(user.id, existingUser.id));

      return {
        success: true,
        message:
          "LOCAL_ADMIN user already exists, ensured admin role is assigned",
        user: {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
        },
      };
    }

    // First create the user using better-auth's signup API
    const { auth } = await import("../auth.js");

    const signupResult = await auth.api.signUpEmail({
      body: {
        email: adminEmail,
        password: adminPassword,
        name: adminName,
      },
      headers: new Headers({
        "Content-Type": "application/json",
      }),
    });

    if (!signupResult || !signupResult.user) {
      throw new Error("Failed to create admin user via signup");
    }

    // Update the user to have admin role
    await db
      .update(user)
      .set({ role: "admin" })
      .where(eq(user.id, signupResult.user.id));

    return {
      success: true,
      message: "LOCAL_ADMIN user created and admin role assigned successfully",
      user: {
        id: signupResult.user.id,
        email: signupResult.user.email,
        name: signupResult.user.name,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
