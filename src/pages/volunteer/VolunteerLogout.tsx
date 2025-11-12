import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const VolunteerLogout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const logout = async () => {
      await supabase.auth.signOut();
      localStorage.clear();
      navigate("/auth");
    };
    logout();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-600">
      Logging out...
    </div>
  );
};

export default VolunteerLogout;
