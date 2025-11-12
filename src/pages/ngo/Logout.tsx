import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const NGOLogout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("user");
    alert("You have been logged out successfully!");
    navigate("/auth");
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center text-blue-700 font-semibold">
      Logging out...
    </div>
  );
};

export default NGOLogout;
