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
  const message = url.searchParams.get("message");

  if (mode !== "signin" && mode !== "signup") {
    throw redirect("/auth?mode=signin");
  }

  return { mode, message };
}

export default function Auth({
  loaderData,
}: {
  loaderData: { mode: string; message: string | null };
}) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      {loaderData.message && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded shadow-lg">
            {loaderData.message}
          </div>
        </div>
      )}
      <AuthForm mode={loaderData.mode as "signin" | "signup"} />
    </main>
  );
}
