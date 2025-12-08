import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Home, Package, Users, Shield, User, LogOut, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function Navigation() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");

  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      setUser(session.user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        setRole(profile.role);
        setUserName(profile.full_name);
      }
    };

    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      fetchUser();
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({ title: "Logged out successfully" });
      navigate("/", { replace: true });
      window.location.reload();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: "Please try again.",
      });
    }
  };

  const getDashboardLink = () => {
    if (role === "admin") return "/admin";
    if (role === "ngo") return "/ngo/dashboard";
    if (role === "donor") return "/donor/dashboard";
    if (role === "volunteer") return "/volunteer/dashboard";
    return "/";
  };

  return (
    <motion.nav
      className="sticky top-0 z-50 bg-white/70 backdrop-blur-lg border-b border-border shadow-sm"
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">

          {/* LOGO */}
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-lg hover:text-primary transition"
          >
            <Package className="h-6 w-6 text-primary" />
            DonateConnect
          </Link>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {/* Dashboard */}
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Link to={getDashboardLink()}>
                    <Button variant="ghost" size="sm">
                      <Home className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                </motion.div>

                {/* ROLE SPECIFIC */}
                {role === "donor" && (
                  <>
                    <motion.div whileHover={{ scale: 1.05 }}>
                      <Link to="/donor/create-donation">
                        <Button variant="ghost" size="sm">
                          <Package className="h-4 w-4 mr-2" />
                          Create Donation
                        </Button>
                      </Link>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.05 }}>
                      <Link to="/donor/donations">
                        <Button variant="ghost" size="sm">
                          My Donations
                        </Button>
                      </Link>
                    </motion.div>
                  </>
                )}

                {role === "ngo" && (
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Link to="/ngo/profile">
                      <Button variant="ghost" size="sm">
                        <Users className="h-4 w-4 mr-2" />
                        Profile
                      </Button>
                    </Link>
                  </motion.div>
                )}

                {role === "admin" && (
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Link to="/admin">
                      <Button variant="ghost" size="sm">
                        <Shield className="h-4 w-4 mr-2" />
                        Admin
                      </Button>
                    </Link>
                  </motion.div>
                )}

                {/* USER MENU */}
                <div className="relative">
                  <button
                    className="flex items-center gap-2 px-2 py-1 hover:bg-primary/10 rounded-lg transition"
                    onClick={() => setDropdownOpen((prev) => !prev)}
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden md:inline font-medium">{userName}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-40 bg-white border rounded-xl shadow-lg p-2"
                      >
                        <Link
                          to={getDashboardLink()}
                          className="block px-3 py-2 hover:bg-gray-100 rounded-lg"
                          onClick={() => setDropdownOpen(false)}
                        >
                          Dashboard
                        </Link>

                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2 px-3 py-2 hover:bg-gray-100 text-red-600 rounded-lg"
                        >
                          <LogOut className="h-4 w-4" /> Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <motion.div whileHover={{ scale: 1.05 }}>
                <Button
                  onClick={() => navigate("/auth")}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  Sign In / Sign Up
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
