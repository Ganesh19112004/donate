import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleOAuth = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        return navigate("/auth");
      }

      const user = data.session.user;
      const email = user.email?.toLowerCase() || "";
      const name =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        "User";

      // 🔥 Decide role automatically
      // If email exists in donors -> donor
      // If exists in volunteers -> volunteer
      // Otherwise create donor by default

      // 1️⃣ Check donor
      const { data: donor } = await supabase
        .from("donors")
        .select("*")
        .eq("email", email)
        .maybeSingle();

      if (donor) {
        localStorage.setItem("user", JSON.stringify(donor));
        localStorage.setItem("role", "donor");
        return navigate("/donor/dashboard");
      }

      // 2️⃣ Check volunteer
      const { data: volunteer } = await supabase
        .from("volunteers")
        .select("*")
        .eq("email", email)
        .maybeSingle();

      if (volunteer) {
        localStorage.setItem("user", JSON.stringify(volunteer));
        localStorage.setItem("role", "volunteer");
        return navigate("/volunteer/dashboard");
      }

      // 3️⃣ If not exists → create donor by default
      const { data: newDonor, error: insertError } = await supabase
        .from("donors")
        .insert({
          name,
          email,
          auth_id: user.id,
          provider: "google",
          created_at: new Date(),
        })
        .select()
        .single();

      if (insertError) {
        console.error(insertError);
        return navigate("/auth");
      }

      localStorage.setItem("user", JSON.stringify(newDonor));
      localStorage.setItem("role", "donor");

      navigate("/donor/dashboard");
    };

    handleOAuth();
  }, [navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <p className="text-lg font-semibold">Signing you in...</p>
    </div>
  );
};

export default AuthCallback;