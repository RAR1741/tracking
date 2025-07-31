import { Link, useNavigate } from "react-router";
import { signOut } from "../../server/auth/auth-client";

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
    <header className="sticky top-0 z-50 w-full border-b border-red-700 bg-red-600/95 backdrop-blur supports-[backdrop-filter]:bg-red-600/90 dark:bg-red-700/95 dark:border-red-800 dark:supports-[backdrop-filter]:bg-red-700/90">
      <div className="container mx-auto flex h-14 items-center px-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
        >
          <div className="h-10 w-35 flex items-center justify-center">
            <img
              src="/RAR-horizontal-logo.png"
              alt="Red Alert Robotics Logo"
              onError={(e) => {
                // Fallback if logo doesn't load
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
          </div>
          <span className="font-bold text-lg text-rar-black">RAR Tracking</span>
        </Link>

        {/* Navigation Menu */}
        <nav className="flex items-center space-x-6 ml-8">
          {session?.user && (
            <>
              <Link
                to="/"
                className="text-sm font-medium transition-colors hover:text-gray-800 text-rar-black"
              >
                Home
              </Link>

              {permissions.canManageUsers && (
                <Link
                  to="/users"
                  className="text-sm font-medium transition-colors hover:text-gray-800 text-rar-black"
                >
                  Users
                </Link>
              )}

              {permissions.isAdmin && (
                <Link
                  to="/admin"
                  className="text-sm font-medium transition-colors hover:text-gray-800 text-rar-black"
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
              <span className="text-sm font-medium text-rar-black max-w-[150px] truncate">
                {displayName}
              </span>
              <button
                onClick={handleSignOut}
                className="text-sm font-medium transition-colors hover:text-gray-800 text-rar-black"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="text-sm font-medium transition-colors hover:text-gray-800 text-rar-black px-3 py-1 rounded-md hover:bg-red-700/20"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
