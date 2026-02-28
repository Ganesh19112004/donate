import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, Home } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("donor");
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Auto redirect if already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedRole = localStorage.getItem("role");
    if (storedUser && storedRole) {
      navigate(`/${storedRole}/dashboard`);
    }
  }, [navigate]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  /* ===========================
     EMAIL SIGNUP / LOGIN
     =========================== */
  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    const table = `${role}s`;

    try {
      // 🚫 NGO cannot signup here
      if (role === "ngo" && isSignup) {
        alert("NGOs must apply for verification first.");
        setLoading(false);
        return;
      }

      // SIGNUP (Donor & Volunteer Only)
      if (isSignup && role !== "admin" && role !== "ngo") {
        const { data: exists } = await supabase
          .from(table)
          .select("id")
          .eq("email", formData.email.trim().toLowerCase())
          .maybeSingle();

        if (exists) throw new Error("User already exists");

        const { error } = await supabase.from(table).insert({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          created_at: new Date(),
        });

        if (error) throw error;

        alert("Account created! Please sign in.");
        setIsSignup(false);
        setFormData({ name: "", email: "", password: "" });
      } else {
        // LOGIN
        const { data } = await supabase
          .from(table)
          .select("*")
          .eq("email", formData.email.trim().toLowerCase())
          .eq("password", formData.password)
          .maybeSingle();

        if (!data) throw new Error("Invalid credentials");

        localStorage.setItem("user", JSON.stringify(data));
        localStorage.setItem("role", role);
        localStorage.setItem("loginTime", new Date().toISOString());

        navigate(`/${role}/dashboard`);
      }
    } catch (err) {
      alert(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  /* ===========================
     GOOGLE SIGN IN
     =========================== */
const handleGoogleLogin = async () => {
  if (role !== "donor" && role !== "volunteer") {
    alert("Google login allowed only for Donor & Volunteer");
    return;
  }

  localStorage.setItem("oauth_role", role);

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    alert(error.message);
  }
};
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 via-white to-blue-100 p-6">

      {/* Header */}
      <div className="w-full max-w-md mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-extrabold text-blue-700">DenaSetu</h1>
        <Link to="/" className="flex items-center gap-2 text-blue-600">
          <Home className="w-5 h-5" /> Home
        </Link>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 border">
        <h2 className="text-2xl font-bold text-center text-blue-700 mb-2">
          {role === "ngo"
            ? "NGO Login"
            : isSignup
            ? "Create Account"
            : "Welcome Back"}
        </h2>

        {/* Role Selector */}
        <div className="flex justify-between mb-6 bg-blue-50 p-1 rounded-xl">
          {["admin", "donor", "ngo", "volunteer"].map((r) => (
            <button
              key={r}
              onClick={() => {
                setRole(r);
                if (r === "admin" || r === "ngo") setIsSignup(false);
              }}
              className={`w-1/4 py-2 text-sm font-semibold rounded-lg ${
                role === r
                  ? "bg-blue-600 text-white"
                  : "text-blue-600 hover:bg-blue-100"
              }`}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-4">

          {/* Name field only for donor & volunteer signup */}
          {isSignup && role !== "admin" && role !== "ngo" && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
              required
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold"
          >
            {loading ? (
              <Loader2 className="animate-spin mx-auto" />
            ) : isSignup
              ? "Sign Up"
              : "Sign In"}
          </button>

          {/* Google login */}
          {(role === "donor" || role === "volunteer") && (
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full border py-3 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-50"
            >
              <img
                src="https://developers.google.com/identity/images/g-logo.png"
                alt="Google"
                className="w-5 h-5"
              />
              Continue with Google
            </button>
          )}

          {/* Apply for NGO Account */}
          {role === "ngo" && (
            <div className="text-center mt-4">
              <p className="text-sm">
                Not registered?{" "}
                <Link
                  to="/ngo-apply"
                  className="text-blue-600 font-semibold"
                >
                  Apply for NGO Account
                </Link>
              </p>
            </div>
          )}

          {/* Switch (Not for admin & NGO) */}
          {role !== "admin" && role !== "ngo" && (
            <p className="text-center text-sm mt-4">
              {isSignup ? (
                <>
                  Already have an account?{" "}
                  <span
                    onClick={() => setIsSignup(false)}
                    className="text-blue-600 cursor-pointer"
                  >
                    Sign In
                  </span>
                </>
              ) : (
                <>
                  New here?{" "}
                  <span
                    onClick={() => setIsSignup(true)}
                    className="text-blue-600 cursor-pointer"
                  >
                    Create Account
                  </span>
                </>
              )}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Auth;
