import { eq } from "drizzle-orm";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";
import { auth } from "../../auth";
import { database } from "../../database/context";
import { user } from "../../database/schema";
import { PERMISSIONS } from "../../database/seed";
import {
  createAuthContextFromSession,
  requirePermission,
} from "../lib/auth-utils";
import {
  assignPermissionToUser,
  assignRoleToUser,
  getAllPermissions,
  getAllRoles,
  getUserWithRolesAndPermissions,
  removePermissionFromUser,
  removeRoleFromUser,
} from "../lib/user-permissions";

interface LoaderArgs {
  params: { userId: string };
  request: Request;
}

interface ActionArgs {
  request: Request;
  params: { userId: string };
}

export async function loader({ params, request }: LoaderArgs) {
  const { userId } = params;

  if (!userId) {
    throw new Response("User ID is required", { status: 400 });
  }

  // Get session information and check permissions
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // Create auth context and check permissions
  const authContext = createAuthContextFromSession(session);
  await requirePermission(authContext, PERMISSIONS.USER_UPDATE);

  const [userData, allRoles, allPermissions] = await Promise.all([
    getUserWithRolesAndPermissions(userId),
    getAllRoles(),
    getAllPermissions(),
  ]);

  if (!userData) {
    throw new Response("User not found", { status: 404 });
  }

  return {
    user: userData,
    allRoles,
    allPermissions,
  };
}

export async function action({ request, params }: ActionArgs) {
  const { userId } = params;

  if (!userId) {
    return { error: "User ID is required" };
  }

  // Get session information and check permissions
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // Create auth context and check permissions
  const authContext = createAuthContextFromSession(session);
  await requirePermission(authContext, PERMISSIONS.USER_UPDATE);

  const formData = await request.formData();
  const actionType = formData.get("actionType") as string;

  try {
    switch (actionType) {
      case "assignRole": {
        const roleId = formData.get("roleId") as string;
        if (roleId) {
          await assignRoleToUser(userId, roleId);
        }
        break;
      }
      case "removeRole": {
        const roleId = formData.get("roleId") as string;
        if (roleId) {
          await removeRoleFromUser(userId, roleId);
        }
        break;
      }
      case "assignPermission": {
        const permissionId = formData.get("permissionId") as string;
        if (permissionId) {
          await assignPermissionToUser(userId, permissionId);
        }
        break;
      }
      case "removePermission": {
        const permissionId = formData.get("permissionId") as string;
        if (permissionId) {
          await removePermissionFromUser(userId, permissionId);
        }
        break;
      }
      case "updateUser": {
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;

        if (name && email) {
          const db = database();
          await db
            .update(user)
            .set({ name, email, updatedAt: new Date() })
            .where(eq(user.id, userId));
        }
        break;
      }
      default:
        return { error: "Invalid action type" };
    }

    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

export default function UserEdit() {
  const {
    user: userData,
    allRoles,
    allPermissions,
  } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const isSubmitting = navigation.state === "submitting";

  const userRoleIds = new Set(userData.roles.map((role) => role.id));
  const userDirectPermissionIds = new Set(
    userData.directPermissions.map((perm) => perm.id)
  );
  const availableRoles = allRoles.filter((role) => !userRoleIds.has(role.id));
  const availablePermissions = allPermissions.filter(
    (perm) => !userDirectPermissionIds.has(perm.id)
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Edit User
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage user details, roles, and permissions
        </p>
      </div>

      {actionData?.error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded dark:bg-red-900 dark:border-red-600 dark:text-red-300">
          {actionData.error}
        </div>
      )}

      {actionData?.success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded dark:bg-green-900 dark:border-green-600 dark:text-green-300">
          Changes saved successfully
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            User Details
          </h2>
          <Form method="post" className="space-y-4">
            <input type="hidden" name="actionType" value="updateUser" />
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                defaultValue={userData.name || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                defaultValue={userData.email}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </Form>
        </div>

        {/* Current Roles */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Current Roles
          </h2>
          <div className="space-y-2">
            {userData.roles.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">
                No roles assigned
              </p>
            ) : (
              userData.roles.map((role) => (
                <div
                  key={role.id}
                  className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900 rounded-md"
                >
                  <div>
                    <span className="font-medium text-blue-900 dark:text-blue-100">
                      {role.name}
                    </span>
                    {role.description && (
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {role.description}
                      </p>
                    )}
                  </div>
                  <Form method="post" className="inline">
                    <input type="hidden" name="actionType" value="removeRole" />
                    <input type="hidden" name="roleId" value={role.id} />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </Form>
                </div>
              ))
            )}
          </div>

          {/* Assign New Role */}
          {availableRoles.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">
                Assign Role
              </h3>
              <Form method="post" className="flex gap-2">
                <input type="hidden" name="actionType" value="assignRole" />
                <select
                  name="roleId"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Select a role...</option>
                  {availableRoles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  Assign
                </button>
              </Form>
            </div>
          )}
        </div>

        {/* Current Direct Permissions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Direct Permissions
          </h2>
          <div className="space-y-2">
            {userData.directPermissions.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">
                No direct permissions assigned
              </p>
            ) : (
              userData.directPermissions.map((permission) => (
                <div
                  key={permission.id}
                  className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900 rounded-md"
                >
                  <div>
                    <span className="font-medium text-green-900 dark:text-green-100">
                      {permission.name}
                    </span>
                    {permission.description && (
                      <p className="text-sm text-green-700 dark:text-green-300">
                        {permission.description}
                      </p>
                    )}
                  </div>
                  <Form method="post" className="inline">
                    <input
                      type="hidden"
                      name="actionType"
                      value="removePermission"
                    />
                    <input
                      type="hidden"
                      name="permissionId"
                      value={permission.id}
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </Form>
                </div>
              ))
            )}
          </div>

          {/* Assign New Permission */}
          {availablePermissions.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">
                Assign Permission
              </h3>
              <Form method="post" className="flex gap-2">
                <input
                  type="hidden"
                  name="actionType"
                  value="assignPermission"
                />
                <select
                  name="permissionId"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Select a permission...</option>
                  {availablePermissions.map((permission) => (
                    <option key={permission.id} value={permission.id}>
                      {permission.name}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  Assign
                </button>
              </Form>
            </div>
          )}
        </div>

        {/* All Permissions Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            All Effective Permissions
          </h2>
          <div className="max-h-64 overflow-y-auto">
            {userData.allPermissions.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No permissions</p>
            ) : (
              <div className="space-y-1">
                {userData.allPermissions.sort().map((permission) => (
                  <div
                    key={permission}
                    className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm"
                  >
                    {permission}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <a
          href="/"
          className="bg-gray-600 text-white py-2 px-6 rounded-md hover:bg-gray-700"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
}
