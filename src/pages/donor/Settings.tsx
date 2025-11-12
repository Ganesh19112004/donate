import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, ArrowLeft } from "lucide-react";

const DonorSettings = () => {
  const navigate = useNavigate();
  const [donor, setDonor] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setDonor(JSON.parse(stored));
  }, []);

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out?")) {
      localStorage.clear();
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6 flex flex-col items-center">
      <div className="w-full max-w-xl flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold"
        >
          <ArrowLeft size={20} /> Back
        </button>
        <h1 className="text-3xl font-extrabold text-blue-700">Settings</h1>
      </div>

      <div className="bg-white shadow-lg border border-gray-200 rounded-2xl p-8 w-full max-w-xl space-y-6">
        {donor && (
          <div className="text-center">
            <img
              src={
                donor.image_url ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt="Profile"
              className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-blue-200"
            />
            <h2 className="text-xl font-bold text-blue-700">{donor.name}</h2>
            <p className="text-gray-600">{donor.email}</p>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="w-full bg-red-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-red-700 font-semibold"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );
};

export default DonorSettings;
