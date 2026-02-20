import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Package,
  FileText,
  Settings,
  Users,
  BarChart3,
  User,
  MapPin,
} from "lucide-react";

export const Layout = ({ children }) => {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isSuperAdmin =
    user?.email?.toLowerCase() === "adhithyanshanmugam@gmail.com";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  const userNavItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/resources", label: "Resources", icon: Package },
    { path: "/my-sites", label: "My Sites", icon: MapPin },
    { path: "/my-requests", label: "My Requests", icon: FileText },
    { path: "/profile", label: "My Profile", icon: User },
  ];

  const adminNavItems = [
    { path: "/admin", label: "Admin Dashboard", icon: LayoutDashboard },
    { path: "/admin/sites", label: "Manage Sites", icon: MapPin },
    { path: "/admin/requests", label: "All Requests", icon: FileText },
    { path: "/admin/resources", label: "Manage Resources", icon: Settings },
    { path: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    // Show Manage Users only to super admin
    { path: "/admin/users", label: "Manage Users", icon: Users },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link
                to={isAdmin ? "/admin" : "/dashboard"}
                className="flex items-center"
              >
                <Package className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  Resource System
                </span>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(item.path)
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Link>
                );
              })}

              <div className="flex items-center ml-4 pl-4 border-l border-gray-200">
                <div className="flex items-center mr-4">
                  <span className="text-sm text-gray-700 font-medium">
                    {user?.fullName ?? user?.email}
                  </span>
                  {isAdmin && (
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                      Admin
                    </span>
                  )}
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </button>
              </div>
            </div>

            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-xl text-base font-semibold transition-all ${isActive(item.path)
                      ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100/50"
                      : "text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                      }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </Link>
                );
              })}
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.fullName ?? user?.email}
                  </p>
                  {isAdmin && (
                    <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                      Admin
                    </span>
                  )}
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {children}
      </main>
    </div>
  );
};
