import { auth } from "../../auth";
import { PERMISSIONS } from "../../database/seed";
import {
  createAuthContextFromSession,
  requirePermission,
} from "../lib/auth-utils";

interface LoaderArgs {
  request: Request;
}

export async function loader({ request }: LoaderArgs) {
  // Get session information
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // Create auth context and check admin permissions
  const authContext = createAuthContextFromSession(session);
  await requirePermission(authContext, PERMISSIONS.SYSTEM_ADMIN);

  return { session };
}

export default function Admin() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          System administration panel
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            System Settings
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Configure system-wide settings and preferences.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            User Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Advanced user management and role assignment.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            System Logs
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            View and analyze system logs and events.
          </p>
        </div>
      </div>
    </div>
  );
}
