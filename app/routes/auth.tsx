import { redirect } from "react-router";
import { AuthForm } from "~/components/auth-form";

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

export default function Auth({ loaderData }: { loaderData: { mode: string } }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <AuthForm mode={loaderData.mode as "signin" | "signup"} />
    </main>
  );
}
