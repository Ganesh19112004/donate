import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      // 🔥 VERY IMPORTANT: wait for session
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;

      if (!session) {
        return navigate("/auth");
      }

      const user = session.user;

      const role = localStorage.getItem("oauth_role");
      if (!role) {
        return navigate("/auth");
      }

      const table = role === "donor" ? "donors" : "volunteers";

      const email = user.email?.toLowerCase();
      const name =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        "User";

      // 1️⃣ Check by auth_id
      const { data: byAuthId } = await supabase
        .from(table)
        .select("*")
        .eq("auth_id", user.id)
        .maybeSingle();

      if (byAuthId) {
        localStorage.setItem("user", JSON.stringify(byAuthId));
        localStorage.setItem("role", role);
        return navigate(`/${role}/dashboard`);
      }

      // 2️⃣ Check by email
      const { data: byEmail } = await supabase
        .from(table)
        .select("*")
        .eq("email", email)
        .maybeSingle();

      let profile;

      if (byEmail) {
        // Link Google account
        const { data, error } = await supabase
          .from(table)
          .update({
            auth_id: user.id,
            provider: "google",
          })
          .eq("email", email)
          .select()
          .single();

        if (error) {
          alert(error.message);
          return navigate("/auth");
        }

        profile = data;
      } else {
        // New Google user
        const { data, error } = await supabase
          .from(table)
          .insert({
            auth_id: user.id,
            name,
            email,
            provider: "google",
            created_at: new Date(),
          })
          .select()
          .single();

        if (error) {
          alert(error.message);
          return navigate("/auth");
        }

        profile = data;
      }

      localStorage.setItem("user", JSON.stringify(profile));
      localStorage.setItem("role", role);

      navigate(`/${role}/dashboard`);
    };

    run();
  }, [navigate]);

  return <p className="text-center mt-20">Signing you in...</p>;
};

export default AuthCallback;