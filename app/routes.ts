import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("auth", "routes/auth.tsx"),
  route("auth/signout", "routes/auth.signout.tsx"),
  route("users", "routes/users.tsx"),
  route("users/:userId/edit", "routes/user-edit.tsx"),
  route("admin", "routes/admin.tsx"),
] satisfies RouteConfig;
