import { Link, useNavigate } from "react-router";
import { signOut } from "../lib/auth-client";

interface User {
  id: string;
  name?: string | null;
  email: string;
}

interface Session {
  user?: User;
}

interface Permissions {
  canManageUsers: boolean;
  isAdmin: boolean;
}

interface HeaderProps {
  session?: Session | null;
  permissions: Permissions;
}

export function Header({ session, permissions }: HeaderProps) {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch {
      // Handle sign out error silently
      navigate("/");
    }
  };

  const displayName = session?.user?.name || session?.user?.email || "User";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-gray-900/95 dark:border-gray-700 dark:supports-[backdrop-filter]:bg-gray-900/60">
      <div className="container mx-auto flex h-14 items-center px-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
        >
          <div className="h-10 w-35 flex items-center justify-center">
            <img
              src="/hor-logo.png"
              alt="Red Alert Robotics Logo"
              onError={(e) => {
                // Fallback if logo doesn't load
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
          </div>
          <span className="font-bold text-lg text-gray-900 dark:text-white">
            RAR Tracking
          </span>
        </Link>

        {/* Navigation Menu */}
        <nav className="flex items-center space-x-6 ml-8">
          {session?.user && (
            <>
              <Link
                to="/"
                className="text-sm font-medium transition-colors hover:text-red-600 dark:hover:text-red-400 text-gray-700 dark:text-gray-200"
              >
                Home
              </Link>

              {permissions.canManageUsers && (
                <Link
                  to="/users"
                  className="text-sm font-medium transition-colors hover:text-red-600 dark:hover:text-red-400 text-gray-700 dark:text-gray-200"
                >
                  Users
                </Link>
              )}

              {permissions.isAdmin && (
                <Link
                  to="/admin"
                  className="text-sm font-medium transition-colors hover:text-red-600 dark:hover:text-red-400 text-gray-700 dark:text-gray-200"
                >
                  Admin
                </Link>
              )}
            </>
          )}
        </nav>

        {/* User Menu */}
        <div className="ml-auto flex items-center space-x-4">
          {session?.user ? (
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200 max-w-[150px] truncate">
                {displayName}
              </span>
              <button
                onClick={handleSignOut}
                className="text-sm font-medium transition-colors hover:text-red-600 dark:hover:text-red-400 text-gray-600 dark:text-gray-300"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="text-sm font-medium transition-colors hover:text-red-600 dark:hover:text-red-400 text-gray-700 dark:text-gray-200 px-3 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
