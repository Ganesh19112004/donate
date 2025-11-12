import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const user = localStorage.getItem("user");
    const role = localStorage.getItem("role");

    // Small delay to ensure values are loaded even after refresh
    const timer = setTimeout(() => {
      if (!user || !role) {
        setIsAuthenticated(false);
      } else if (!allowedRoles.includes(role)) {
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
      }
    }, 200); // Wait 200ms to prevent early redirect on fast refresh

    return () => clearTimeout(timer);
  }, [allowedRoles]);

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen text-blue-600 font-semibold">
        Loading your session...
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" replace />;
};

export default ProtectedRoute;
