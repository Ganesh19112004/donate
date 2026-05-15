
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleOAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error || !session?.user) {
          console.error(error);
          navigate("/auth");
          return;
        }

        const user = session.user;

        const email = user.email?.toLowerCase() || "";

        const name =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          "User";

        const role =
          localStorage.getItem("oauth_role") || "donor";

        const table =
          role === "volunteer"
            ? "volunteers"
            : "donors";

        // CHECK EXISTING USER
        const { data: existingUser } =
          await supabase
            .from(table)
            .select("*")
            .eq("email", email)
            .maybeSingle();

        // EXISTING USER
        if (existingUser) {
          localStorage.setItem(
            "user",
            JSON.stringify(existingUser)
          );

          localStorage.setItem("role", role);

          navigate("/" + role + "/dashboard");

          return;
        }

        // CREATE NEW GOOGLE USER
        const { data: newUser, error: insertError } =
          await supabase
            .from(table)
            .insert({
              name: name,
              email: email,
              password: null,
              auth_id: user.id,
              provider: "google",
              created_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (insertError) {
          console.error(insertError);
          alert(insertError.message);
          navigate("/auth");
          return;
        }

        localStorage.setItem(
          "user",
          JSON.stringify(newUser)
        );

        localStorage.setItem("role", role);

        navigate("/" + role + "/dashboard");
      } catch (err) {
        console.error(err);
        navigate("/auth");
      }
    };

    handleOAuth();
  }, [navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <p className="text-lg font-semibold">
        Signing you in...
      </p>
    </div>
  );
};

export default AuthCallback;
