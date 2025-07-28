import { redirect } from "react-router";
import { AuthForm } from "~/components/auth-form";
import { auth } from "../../auth";

export function meta() {
  return [
    { title: "Authentication" },
    { name: "description", content: "Sign in or sign up to your account" },
  ];
}

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("mode") || "signin";

  if (mode !== "signin" && mode !== "signup") {
    throw redirect("/auth?mode=signin");
  }

  return { mode };
}

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const mode = formData.get("mode") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  try {
    if (mode === "signup") {
      if (!name) {
        return { error: "Name is required for sign up" };
      }

      // Use server-side auth instance for signup
      await auth.api.signUpEmail({
        body: {
          email,
          password,
          name,
        },
      });
    } else {
      // Use server-side auth instance for signin
      await auth.api.signInEmail({
        body: {
          email,
          password,
        },
      });
    }

    // Redirect to home page after successful auth
    throw redirect("/");
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Auth error:", error);
    return { error: "Authentication failed. Please try again." };
  }
}

export default function Auth({
  loaderData,
  actionData,
}: {
  loaderData: { mode: string };
  actionData?: { error?: string };
}) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <AuthForm
        mode={loaderData.mode as "signin" | "signup"}
        error={actionData?.error}
      />
    </main>
  );
}
