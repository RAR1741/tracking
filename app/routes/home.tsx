import { database } from "~/database/context";
import * as schema from "~/database/schema";
import { auth } from "../../auth.js";
import { PERMISSIONS } from "../../database/seed";
import { createAuthContextFromSession } from "../lib/auth-utils";
import { createPermissionChecker } from "../lib/permissions";

import { Welcome } from "../welcome/welcome";
import type { Route } from "./+types/home";

// eslint-disable-next-line no-empty-pattern
export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  let name = formData.get("name");
  let email = formData.get("email");
  if (typeof name !== "string" || typeof email !== "string") {
    return { guestBookError: "Name and email are required" };
  }

  name = name.trim();
  email = email.trim();
  if (!name || !email) {
    return { guestBookError: "Name and email are required" };
  }

  const db = database();
  try {
    await db.insert(schema.guestBook).values({ name, email });
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  } catch (error) {
    return { guestBookError: "Error adding to guest book" };
  }
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const db = database();

  // Get session information - create proper Headers object
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // Check if user can manage users
  let canManageUsers = false;
  if (session?.user) {
    const authContext = createAuthContextFromSession(session);
    const permissions = createPermissionChecker(authContext);
    try {
      canManageUsers = await permissions.can(PERMISSIONS.USER_UPDATE);
    } catch {
      // If permission check fails, default to false
      canManageUsers = false;
    }
  }

  const guestBook = await db.query.guestBook.findMany({
    columns: {
      id: true,
      name: true,
    },
  });

  return {
    guestBook,
    message: context.VALUE_FROM_EXPRESS,
    session,
    canManageUsers,
  };
}

export default function Home({ actionData, loaderData }: Route.ComponentProps) {
  return (
    <Welcome
      guestBook={loaderData.guestBook}
      guestBookError={actionData?.guestBookError}
      message={loaderData.message}
      session={loaderData.session}
      canManageUsers={loaderData.canManageUsers}
    />
  );
}
