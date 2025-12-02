import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, Home } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("donor");
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  // Auto-redirect if already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedRole = localStorage.getItem("role");
    if (storedUser && storedRole) {
      navigate(`/${storedRole}/dashboard`);
    }
  }, [navigate]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Sign Up / Sign In Handler
  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    const table = `${role}s`;

    try {
      if (isSignup && role !== "admin") {
        // SIGNUP FOR NON-ADMIN
        const { data: exists } = await supabase
          .from(table)
          .select("email")
          .eq("email", formData.email.trim().toLowerCase())
          .maybeSingle();

        if (exists) throw new Error("User already exists.");

        const { data, error } = await supabase
          .from(table)
          .insert({
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
            created_at: new Date(),
          })
          .select()
          .single();

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

        if (!data) throw new Error("Invalid credentials!");

        localStorage.setItem("user", JSON.stringify(data));
        localStorage.setItem("role", role);
        localStorage.setItem("loginTime", new Date().toISOString());

        alert(`Welcome back, ${data.name}!`);
        navigate(`/${role}/dashboard`);
      }
    } catch (err) {
      alert(err.message || "Authentication failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 via-white to-blue-100 p-6">

      {/* Header Section */}
      <div className="w-full max-w-md mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-extrabold text-blue-700 tracking-tight">DenaSetu</h1>
        <Link
          to="/"
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition"
        >
          <Home className="w-5 h-5" /> Home
        </Link>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 border border-blue-100">
        <h2 className="text-2xl font-bold text-center text-blue-700 mb-2">
          {isSignup && role !== "admin" ? "Create Account" : "Welcome Back!"}
        </h2>
        <p className="text-center text-gray-600 mb-6">
          {isSignup && role !== "admin"
            ? "Join us and make a difference in the world."
            : "Sign in to continue your contribution."}
        </p>

        {/* Role Selector */}
        <div className="flex justify-between mb-6 bg-blue-50 p-1 rounded-xl shadow-inner">
          {["admin", "donor", "ngo", "volunteer"].map((r) => (
            <button
              key={r}
              onClick={() => {
                setRole(r);
                if (r === "admin") setIsSignup(false); // ❌ disable signup
              }}
              className={`w-1/4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                role === r
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-blue-600 hover:bg-blue-100"
              }`}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-4">
          {/* SHOW NAME FIELD ONLY WHEN SIGNUP + NOT ADMIN */}
          {isSignup && role !== "admin" && (
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-gray-700 font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold transition-all mt-4"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin h-5 w-5" /> Processing...
              </span>
            ) : isSignup && role !== "admin" ? (
              "Sign Up"
            ) : (
              "Sign In"
            )}
          </button>

          {/* Switch Auth Mode (HIDE FOR ADMIN) */}
          {role !== "admin" && (
            <p className="text-center text-sm text-gray-600 mt-4">
              {isSignup ? (
                <>
                  Already have an account?{" "}
                  <span
                    onClick={() => setIsSignup(false)}
                    className="text-blue-600 hover:underline cursor-pointer"
                  >
                    Sign In
                  </span>
                </>
              ) : (
                <>
                  New here?{" "}
                  <span
                    onClick={() => setIsSignup(true)}
                    className="text-blue-600 hover:underline cursor-pointer"
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
