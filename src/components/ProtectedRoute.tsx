import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface ProtectedRouteProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const user = localStorage.getItem("user");
    const role = localStorage.getItem("role");

    const timer = setTimeout(() => {
      if (!user || !role) {
        setIsAuthenticated(false);
      } else if (!allowedRoles.includes(role)) {
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [allowedRoles]);

  // LOADING STATE WITH ANIMATION
  if (isAuthenticated === null) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center min-h-screen text-primary font-semibold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"
        />
        Checking permissions...
      </motion.div>
    );
  }

  // NOT ALLOWED → Redirect to auth and keep original page
  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/auth?redirect=${location.pathname}`}
        replace
      />
    );
  }

  // AUTHENTICATED → Render page with fade-in
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {children}
    </motion.div>
  );
};

export default ProtectedRoute;
