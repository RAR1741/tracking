import { redirect } from "react-router";
import { signOut } from "~/lib/auth-client";

export async function action() {
  try {
    await signOut();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Sign out error:", error);
  }

  throw redirect("/");
}
