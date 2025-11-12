import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, LogOut, Menu, User, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();

  // 🔹 Load session from localStorage
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
      setUserName("");
    }
  }, []);

  // 🔹 Logout handler
  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setRole(null);
    toast({ title: "Logged out successfully!" });
    navigate("/", { replace: true });
    window.location.reload(); // refresh navbar state
  };

  return (
    <header className="w-full bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        <Link to="/" className="text-2xl font-extrabold text-blue-700">
          DenaSetu
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6 items-center">
          <Link to="/" className="hover:text-blue-600 font-medium">
            Home
          </Link>
          <Link to="/how-it-works" className="hover:text-blue-600 font-medium">
            How It Works
          </Link>
          <Link to="/impact" className="hover:text-blue-600 font-medium">
            Impact
          </Link>
          <Link to="/contact" className="hover:text-blue-600 font-medium">
            Contact
          </Link>

          {isLoggedIn ? (
            <>
              <Link
                to={`/${role}/dashboard`}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <User size={18} /> Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-600 font-medium hover:text-red-700"
              >
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <LogIn size={18} /> Sign In
            </Link>
          )}
        </nav>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-blue-700"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg border-t">
          <nav className="flex flex-col p-4 space-y-4">
            <Link to="/" className="hover:text-blue-600 font-medium">
              Home
            </Link>
            <Link to="/how-it-works" className="hover:text-blue-600 font-medium">
              How It Works
            </Link>
            <Link to="/impact" className="hover:text-blue-600 font-medium">
              Impact
            </Link>
            <Link to="/contact" className="hover:text-blue-600 font-medium">
              Contact
            </Link>

            {isLoggedIn ? (
              <>
                <Link
                  to={`/${role}/dashboard`}
                  className="flex items-center gap-2 text-blue-700 font-semibold"
                >
                  <User size={18} /> {userName}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-600 font-medium"
                >
                  <LogOut size={18} /> Logout
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 justify-center"
              >
                <LogIn size={18} /> Sign In
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
