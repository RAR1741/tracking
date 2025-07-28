import { createPermissionChecker, type AuthContext } from "./permissions";

interface Session {
  user?: {
    id: string;
  };
}

// Helper to extract session from request and create auth context
export function createAuthContextFromSession(
  session: Session | null
): AuthContext {
  return {
    userId: session?.user?.id,
    isAuthenticated: Boolean(session?.user),
  };
}

// Utility to check permissions in route loaders/actions
export async function requirePermission(
  authContext: AuthContext,
  permission: string
) {
  const permissions = createPermissionChecker(authContext);
  const hasAccess = await permissions.can(permission);

  if (!hasAccess) {
    throw new Response("Forbidden", { status: 403 });
  }
}

export async function requireAnyPermission(
  authContext: AuthContext,
  permissions: string[]
) {
  const permChecker = createPermissionChecker(authContext);
  const hasAccess = await permChecker.canAny(permissions);

  if (!hasAccess) {
    throw new Response("Forbidden", { status: 403 });
  }
}

export async function requireAuth(authContext: AuthContext) {
  if (!authContext.isAuthenticated) {
    throw new Response("Unauthorized", { status: 401 });
  }
}
