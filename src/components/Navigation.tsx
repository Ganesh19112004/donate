import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Home, Package, Users, Shield, User, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Navigation() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");

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
      window.location.reload(); // ✅ refresh to ensure only new layout remains
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
    <nav className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* ✅ Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">DonateConnect</span>
          </Link>

          {/* ✅ Right-side actions */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to={getDashboardLink()}>
                  <Button variant="ghost" size="sm">
                    <Home className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>

                {role === "donor" && (
                  <>
                    <Link to="/donor/create-donation">
                      <Button variant="ghost" size="sm">
                        <Package className="h-4 w-4 mr-2" />
                        Create Donation
                      </Button>
                    </Link>
                    <Link to="/donor/donations">
                      <Button variant="ghost" size="sm">
                        My Donations
                      </Button>
                    </Link>
                  </>
                )}

                {role === "ngo" && (
                  <Link to="/ngo/profile">
                    <Button variant="ghost" size="sm">
                      <Users className="h-4 w-4 mr-2" />
                      Profile
                    </Button>
                  </Link>
                )}

                {role === "admin" && (
                  <Link to="/admin">
                    <Button variant="ghost" size="sm">
                      <Shield className="h-4 w-4 mr-2" />
                      Admin Panel
                    </Button>
                  </Link>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4" />
                  <span className="hidden md:inline">{userName || "User"}</span>
                </div>

                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Button
                onClick={() => navigate("/auth")}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                Sign In / Sign Up
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
