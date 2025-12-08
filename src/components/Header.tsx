import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { LogIn, LogOut, Menu, User, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const linkHover = {
  initial: { width: 0 },
  hover: { width: "100%", transition: { duration: 0.25 } }
};

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");

  const navigate = useNavigate();
  const { toast } = useToast();

  // session loading
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedRole = localStorage.getItem("role");

    if (storedUser && storedRole) {
      const user = JSON.parse(storedUser);
      setIsLoggedIn(true);
      setRole(storedRole);
      setUserName(user.name || "User");
    } else {
      setIsLoggedIn(false);
      setRole(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setRole(null);
    toast({ title: "Logged out successfully!" });
    navigate("/", { replace: true });
    window.location.reload();
  };

  return (
    <motion.header
      className="w-full sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-border"
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        
        {/* LOGO */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="text-2xl font-extrabold text-blue-700 cursor-pointer"
        >
          <Link to="/">DenaSetu</Link>
        </motion.div>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center space-x-6">
          {["Home", "How It Works", "Impact", "Contact"].map((label, i) => (
            <Link
              key={i}
              to={label === "Home" ? "/" : `/${label.toLowerCase().replace(/ /g, "-")}`}
              className="relative font-medium text-gray-700 hover:text-blue-700"
            >
              {label}

              {/* underline animation */}
              <motion.span
                variants={linkHover}
                initial="initial"
                whileHover="hover"
                className="absolute left-0 -bottom-1 h-[2px] bg-blue-600"
              />
            </Link>
          ))}

          {/* LOGGED IN */}
          {isLoggedIn ? (
            <>
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link
                  to={`/${role}/dashboard`}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  <User size={18} /> Dashboard
                </Link>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-600 font-medium hover:text-red-700"
              >
                <LogOut size={18} /> Logout
              </motion.button>
            </>
          ) : (
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link
                to="/auth"
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <LogIn size={18} /> Sign In
              </Link>
            </motion.div>
          )}
        </nav>

        {/* MOBILE TOGGLE */}
        <motion.button
          whileTap={{ scale: 0.8 }}
          className="md:hidden text-blue-700"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </motion.button>
      </div>

      {/* MOBILE MENU WITH ANIMATION */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="md:hidden bg-white shadow-lg border-t"
          >
            <nav className="flex flex-col p-4 space-y-4">

              {["Home", "How It Works", "Impact", "Contact"].map((label, i) => (
                <motion.div key={i} whileHover={{ x: 6 }}>
                  <Link
                    to={label === "Home" ? "/" : `/${label.toLowerCase().replace(/ /g, "-")}`}
                    className="font-medium text-gray-700 hover:text-blue-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {label}
                  </Link>
                </motion.div>
              ))}

              {isLoggedIn ? (
                <>
                  <motion.div whileHover={{ x: 6 }}>
                    <Link
                      to={`/${role}/dashboard`}
                      className="flex items-center gap-2 text-blue-700 font-semibold"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User size={18} /> {userName}
                    </Link>
                  </motion.div>

                  <motion.button
                    whileHover={{ x: 6 }}
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-red-600 font-medium"
                  >
                    <LogOut size={18} /> Logout
                  </motion.button>
                </>
              ) : (
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Link
                    to="/auth"
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LogIn size={18} /> Sign In
                  </Link>
                </motion.div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
