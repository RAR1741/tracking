import { and, eq, inArray } from "drizzle-orm";
import { database } from "../../database/context";
import {
  permission,
  role,
  rolePermission,
  user,
  userPermission,
  userRole,
} from "../../database/schema";

export interface UserWithRolesAndPermissions {
  id: string;
  name: string | null;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  roles: Array<{
    id: string;
    name: string;
    description: string | null;
  }>;
  directPermissions: Array<{
    id: string;
    name: string;
    description: string | null;
  }>;
  allPermissions: string[];
}

export async function getUserWithRolesAndPermissions(
  userId: string
): Promise<UserWithRolesAndPermissions | null> {
  const db = database();

  // Get user
  const userData = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  if (userData.length === 0) return null;

  const userRecord = userData[0];

  // Get user roles
  const userRoles = await db
    .select({
      id: role.id,
      name: role.name,
      description: role.description,
    })
    .from(userRole)
    .innerJoin(role, eq(userRole.roleId, role.id))
    .where(eq(userRole.userId, userId));

  // Get direct permissions
  const directPermissions = await db
    .select({
      id: permission.id,
      name: permission.name,
      description: permission.description,
    })
    .from(userPermission)
    .innerJoin(permission, eq(userPermission.permissionId, permission.id))
    .where(eq(userPermission.userId, userId));

  // Get permissions from roles
  const roleIds = userRoles.map((r) => r.id);
  const rolePermissions =
    roleIds.length > 0
      ? await db
          .select({
            permissionId: rolePermission.permissionId,
          })
          .from(rolePermission)
          .where(inArray(rolePermission.roleId, roleIds))
      : [];

  // Combine all permissions (direct + from roles)
  const allPermissionIds = new Set([
    ...directPermissions.map((p) => p.id),
    ...rolePermissions.map((rp) => rp.permissionId),
  ]);

  return {
    ...userRecord,
    roles: userRoles,
    directPermissions,
    allPermissions: Array.from(allPermissionIds),
  };
}

export async function assignRoleToUser(
  userId: string,
  roleId: string,
  assignedBy?: string
) {
  const db = database();

  await db
    .insert(userRole)
    .values({
      userId,
      roleId,
      assignedBy,
    })
    .onConflictDoNothing();
}

export async function removeRoleFromUser(userId: string, roleId: string) {
  const db = database();

  await db
    .delete(userRole)
    .where(and(eq(userRole.userId, userId), eq(userRole.roleId, roleId)));
}

export async function assignPermissionToUser(
  userId: string,
  permissionId: string,
  assignedBy?: string
) {
  const db = database();

  await db
    .insert(userPermission)
    .values({
      userId,
      permissionId,
      assignedBy,
    })
    .onConflictDoNothing();
}

export async function removePermissionFromUser(
  userId: string,
  permissionId: string
) {
  const db = database();

  await db
    .delete(userPermission)
    .where(
      and(
        eq(userPermission.userId, userId),
        eq(userPermission.permissionId, permissionId)
      )
    );
}

export async function getAllRoles() {
  const db = database();
  return await db.select().from(role);
}

export async function getAllPermissions() {
  const db = database();
  return await db.select().from(permission);
}

export async function hasPermission(
  userId: string,
  permissionId: string
): Promise<boolean> {
  const userWithPermissions = await getUserWithRolesAndPermissions(userId);
  return userWithPermissions?.allPermissions.includes(permissionId) ?? false;
}

export async function hasAnyPermission(
  userId: string,
  permissionIds: string[]
): Promise<boolean> {
  const userWithPermissions = await getUserWithRolesAndPermissions(userId);
  if (!userWithPermissions) return false;

  return permissionIds.some((permId) =>
    userWithPermissions.allPermissions.includes(permId)
  );
}

export async function hasAllPermissions(
  userId: string,
  permissionIds: string[]
): Promise<boolean> {
  const userWithPermissions = await getUserWithRolesAndPermissions(userId);
  if (!userWithPermissions) return false;

  return permissionIds.every((permId) =>
    userWithPermissions.allPermissions.includes(permId)
  );
}
