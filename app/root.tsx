import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import { auth } from "../auth.js";
import type { Route } from "./+types/root";
import "./app.css";
import { Header } from "./components/header";
import { createAuthContextFromSession } from "./lib/auth-utils";
import { createPermissionChecker } from "./lib/permissions";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export async function loader({ request }: Route.LoaderArgs) {
  // Get session information for the header
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // Check permissions on the server side
  let permissions = {
    canManageUsers: false,
    isAdmin: false,
  };

  if (session?.user) {
    const authContext = createAuthContextFromSession(session);
    const permissionChecker = createPermissionChecker(authContext);

    try {
      const [canManageUsers, isAdmin] = await Promise.all([
        permissionChecker.canManageUsers(),
        permissionChecker.isAdmin(),
      ]);
      permissions = { canManageUsers, isAdmin };
    } catch {
      // If permission check fails, default to false
      permissions = { canManageUsers: false, isAdmin: false };
    }
  }

  return {
    session,
    permissions,
  };
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <Header
        session={loaderData.session}
        permissions={loaderData.permissions}
      />
      <main className="min-h-[calc(100vh-3.5rem)]">
        <Outlet />
      </main>
    </>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  // Default permissions for error boundary
  const defaultPermissions = {
    canManageUsers: false,
    isAdmin: false,
  };

  return (
    <>
      <Header session={null} permissions={defaultPermissions} />
      <main className="pt-16 p-4 container mx-auto">
        <h1>{message}</h1>
        <p>{details}</p>
        {stack && (
          <pre className="w-full p-4 overflow-x-auto">
            <code>{stack}</code>
          </pre>
        )}
      </main>
    </>
  );
}
