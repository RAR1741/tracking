import { redirect } from "react-router";

export async function action({ request }: { request: Request }) {
  // Create a new request to the better-auth signout endpoint
  const url = new URL(request.url);
  const signoutUrl = `${url.origin}/api/auth/sign-out`;

  try {
    // Make a request to better-auth's signout endpoint
    const response = await fetch(signoutUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("Cookie") || "",
      },
    });

    // Get the Set-Cookie headers from the response to clear the session
    const setCookieHeaders = response.headers.getSetCookie?.() || [];

    const headers = new Headers();
    setCookieHeaders.forEach((cookie) => {
      headers.append("Set-Cookie", cookie);
    });

    return redirect("/", { headers });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Sign out error:", error);

    // Fallback: manually clear cookies
    const headers = new Headers();
    headers.append(
      "Set-Cookie",
      "better-auth.session_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax"
    );
    headers.append(
      "Set-Cookie",
      "better-auth.csrf_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax"
    );

    return redirect("/", { headers });
  }
}
