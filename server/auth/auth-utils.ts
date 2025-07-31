import {
  createPermissionChecker,
  type AuthContext,
} from "../../app/lib/permissions";

interface Session {
  user?: {
    id: string;
  };
}

const MESSAGE_LOGIN = "Please sign in to continue";
const MESSAGE_PERMISSION_DENIED =
  "You don't have permission to access that page";

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
  if (!authContext.isAuthenticated) {
    throw new Response(null, {
      status: 302,
      headers: {
        Location: "/auth?mode=signin&message=" + MESSAGE_LOGIN,
      },
    });
  }

  const permissions = createPermissionChecker(authContext);
  const hasAccess = await permissions.can(permission);

  if (!hasAccess) {
    throw new Response(null, {
      status: 302,
      headers: {
        Location: "/auth?mode=signin&message=" + MESSAGE_PERMISSION_DENIED,
      },
    });
  }
}

export async function requireAnyPermission(
  authContext: AuthContext,
  permissions: string[]
) {
  if (!authContext.isAuthenticated) {
    throw new Response(null, {
      status: 302,
      headers: {
        Location: "/auth?mode=signin&message=" + MESSAGE_LOGIN,
      },
    });
  }

  const permChecker = createPermissionChecker(authContext);
  const hasAccess = await permChecker.canAny(permissions);

  if (!hasAccess) {
    throw new Response(null, {
      status: 302,
      headers: {
        Location: "/auth?mode=signin&message=" + MESSAGE_PERMISSION_DENIED,
      },
    });
  }
}

export async function requireAuth(authContext: AuthContext) {
  if (!authContext.isAuthenticated) {
    throw new Response(null, {
      status: 302,
      headers: {
        Location: "/auth?mode=signin&message=" + MESSAGE_LOGIN,
      },
    });
  }
}
