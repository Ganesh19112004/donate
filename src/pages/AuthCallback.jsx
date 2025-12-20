import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;

      if (!user) return navigate("/auth");

      const role = localStorage.getItem("oauth_role");
      if (!role) return navigate("/auth");

      const table = role === "donor" ? "donors" : "volunteers";

      const email = user.email.toLowerCase();
      const name = user.user_metadata.full_name || "User";

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
        // 3️⃣ LINK GOOGLE ACCOUNT
        const { data, error } = await supabase
          .from(table)
          .update({
            auth_id: user.id,
            provider: "google",
          })
          .eq("email", email)
          .select()
          .single();

        if (error) return alert(error.message);
        profile = data;
      } else {
        // 4️⃣ NEW GOOGLE USER
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

        if (error) return alert(error.message);
        profile = data;
      }

      localStorage.setItem("user", JSON.stringify(profile));
      localStorage.setItem("role", role);
      navigate(`/${role}/dashboard`);
    };

    run();
  }, [navigate]);

  return <p className="text-center mt-20">Signing you in…</p>;
};

export default AuthCallback;
