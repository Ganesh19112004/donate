import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [session, setSession] = useState<any>(null);

  const initialMode = searchParams.get("mode") || "donor";

  // Login states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginAsAdmin, setLoginAsAdmin] = useState(false);

  // Signup states
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState(initialMode);
  const [phone, setPhone] = useState("");

  // NGO-specific
  const [ngoName, setNgoName] = useState("");
  const [ngoDescription, setNgoDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [documents, setDocuments] = useState<FileList | null>(null);

  // Admin-specific
  const [adminDepartment, setAdminDepartment] = useState("");
  const [adminReason, setAdminReason] = useState("");

  // ---------------- SESSION MANAGEMENT ----------------
  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setCheckingSession(false);

      if (session) await handleRedirect(session.user.id);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) handleRedirect(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ---------------- ROLE-BASED REDIRECT ----------------
  const handleRedirect = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (error) return console.error("Error fetching role:", error);
      if (!profile?.role) return;

      const routes: Record<string, string> = {
        admin: "/admin",
        ngo: "/ngo/dashboard",
        donor: "/donor/dashboard",
        volunteer: "/volunteer/dashboard",
      };

      navigate(routes[profile.role] || "/");
    } catch (err) {
      console.error("Redirect error:", err);
    }
  };

  // ---------------- LOGIN ----------------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim().toLowerCase(),
        password: loginPassword,
      });
      if (error) throw error;

      if (data?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (loginAsAdmin && profile?.role !== "admin") {
          toast({
            variant: "destructive",
            title: "Access denied",
            description: "This account is not an admin account.",
          });
          await supabase.auth.signOut();
          return;
        }

        toast({
          title: "Welcome back!",
          description: "Redirecting to your dashboard...",
        });
        await handleRedirect(data.user.id);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Invalid credentials.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ---------------- GOOGLE LOGIN ----------------
  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Google Sign-In failed",
        description: error.message,
      });
    }
  };

  // ---------------- SIGNUP ----------------
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!signupEmail || !signupPassword || !fullName) {
        throw new Error("Please fill all required fields.");
      }

      const { data, error } = await supabase.auth.signUp({
        email: signupEmail.trim().toLowerCase(),
        password: signupPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          data: { full_name: fullName, role },
        },
      });

      if (error) throw error;
      if (!data.user) throw new Error("Signup failed. Please try again.");

      const userId = data.user.id;

      await supabase.from("profiles").upsert({
        id: userId,
        full_name: fullName,
        phone,
        role,
        created_at: new Date(),
      });

      if (role === "ngo") {
        const { data: ngoData, error: ngoError } = await supabase
          .from("ngos")
          .insert({
            profile_id: userId,
            name: ngoName,
            description: ngoDescription,
            address,
            city,
            state,
            pincode,
            active: false,
          })
          .select()
          .single();

        if (ngoError) throw ngoError;

        if (documents && documents.length > 0) {
          const file = documents[0];
          const filePath = `${userId}/registration.${file.name.split(".").pop()}`;
          const { error: uploadError } = await supabase.storage
            .from("ngo-documents")
            .upload(filePath, file);
          if (uploadError) throw uploadError;

          await supabase
            .from("ngos")
            .update({ registration_doc_path: filePath })
            .eq("id", ngoData.id);
        }

        toast({
          title: "NGO registration submitted",
          description: "Your application is pending admin approval.",
        });
      }

      if (role === "admin") {
        await supabase.from("pending_admins").insert({
          profile_id: userId,
          department: adminDepartment,
          reason: adminReason,
          status: "pending",
        });
        toast({
          title: "Admin access requested",
          description: "Your request is pending approval.",
        });
      }

      if (role === "donor" || role === "volunteer") {
        toast({
          title: "Signup successful",
          description: "Redirecting to your dashboard...",
        });
        await handleRedirect(userId);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Signup failed",
        description: error.message || "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ---------------- UI ----------------
  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Redirecting...</CardTitle>
            <CardDescription>Loading your dashboard...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // ---------------- MAIN AUTH UI ----------------
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-2xl shadow-elevated">
        <CardHeader>
          <CardTitle className="text-3xl text-center text-primary">Welcome to DonateConnect</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Join our community of donors, NGOs, volunteers, and admins.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {/* LOGIN */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
                <Label>Password</Label>
                <Input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="loginAsAdmin"
                    checked={loginAsAdmin}
                    onChange={(e) => setLoginAsAdmin(e.target.checked)}
                  />
                  <Label htmlFor="loginAsAdmin" className="cursor-pointer">
                    Login as Admin
                  </Label>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Login"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-3 flex items-center justify-center gap-2"
                  onClick={handleGoogleLogin}
                >
                  <img
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    alt="Google"
                    className="w-5 h-5"
                  />
                  Continue with Google
                </Button>
              </form>
            </TabsContent>

            {/* SIGNUP */}
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <Label>I am a</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="donor">Donor</SelectItem>
                    <SelectItem value="ngo">NGO</SelectItem>
                    <SelectItem value="volunteer">Volunteer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>

                <Label>Full Name</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />

                <Label>Phone</Label>
                <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />

                <Label>Email</Label>
                <Input type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required />

                <Label>Password</Label>
                <Input type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required />

                {role === "ngo" && (
                  <>
                    <Label>Organization Name</Label>
                    <Input value={ngoName} onChange={(e) => setNgoName(e.target.value)} required />

                    <Label>Description</Label>
                    <Textarea value={ngoDescription} onChange={(e) => setNgoDescription(e.target.value)} />

                    <Label>Address</Label>
                    <Input value={address} onChange={(e) => setAddress(e.target.value)} required />

                    <div className="grid md:grid-cols-3 gap-4">
                      <Input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} required />
                      <Input placeholder="State" value={state} onChange={(e) => setState(e.target.value)} required />
                      <Input placeholder="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} required />
                    </div>

                    <Label>Upload Registration Document</Label>
                    <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setDocuments(e.target.files)} />
                  </>
                )}

                {role === "admin" && (
                  <>
                    <Label>Department</Label>
                    <Input value={adminDepartment} onChange={(e) => setAdminDepartment(e.target.value)} />

                    <Label>Reason for Access</Label>
                    <Textarea value={adminReason} onChange={(e) => setAdminReason(e.target.value)} required />
                  </>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-3 flex items-center justify-center gap-2"
                  onClick={handleGoogleLogin}
                >
                  <img
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    alt="Google"
                    className="w-5 h-5"
                  />
                  Continue with Google
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-primary hover:underline">
              Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
