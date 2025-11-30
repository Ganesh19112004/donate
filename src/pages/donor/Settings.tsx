import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  ArrowLeft,
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Trash2,
  Edit,
  Camera,
  Phone,
  MapPin,
  KeyRound,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const DonorSettings = () => {
  const navigate = useNavigate();
  const [donor, setDonor] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    image_url: "",
  });

  // Load donor data
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const user = JSON.parse(stored);
      setDonor(user);
      setForm({
        name: user.name,
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        image_url: user.image_url || "",
      });
    }
  }, []);

  //-----------------------------------------
  // 🔵 Update Profile
  //-----------------------------------------
  const updateProfile = async () => {
    const { error } = await supabase
      .from("donors")
      .update(form)
      .eq("id", donor.id);

    if (!error) {
      alert("Profile updated successfully!");
      const updatedUser = { ...donor, ...form };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setDonor(updatedUser);
      setEditMode(false);
    } else {
      alert("Error updating profile.");
    }
  };

  //-----------------------------------------
  // 🔵 Change Password
  //-----------------------------------------
  const changePassword = async () => {
    const newPass = prompt("Enter new password:");
    if (!newPass) return;

    const { error } = await supabase
      .from("donors")
      .update({ password: newPass })
      .eq("id", donor.id);

    if (!error) alert("Password updated.");
  };

  //-----------------------------------------
  // 🔴 Delete Account
  //-----------------------------------------
  const deleteAccount = async () => {
    if (!confirm("⚠ This will permanently delete your account. Proceed?")) return;

    await supabase.from("donors").delete().eq("id", donor.id);
    localStorage.clear();
    navigate("/auth");
  };

  //-----------------------------------------
  // 🔵 Logout
  //-----------------------------------------
  const handleLogout = () => {
    if (confirm("Are you sure you want to log out?")) {
      localStorage.clear();
      navigate("/auth");
    }
  };

  //-----------------------------------------
  // JSX STARTS HERE
  //-----------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6 flex flex-col items-center">
      
      {/* HEADER */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold"
        >
          <ArrowLeft size={20} /> Back
        </button>

        <h1 className="text-3xl font-extrabold text-blue-700 flex items-center gap-2">
          <Settings /> Settings
        </h1>
      </div>

      {/* MAIN CARD */}
      <div className="bg-white w-full max-w-2xl p-8 rounded-2xl shadow-lg border space-y-8">

        {/* Profile Section */}
        <div className="text-center">
          <div className="relative w-28 mx-auto">
            <img
              src={
                form.image_url ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              className="w-28 h-28 rounded-full border-4 border-blue-200 mx-auto"
            />

            <button
              className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow"
              onClick={() => {
                const url = prompt("Enter new profile image URL:");
                if (url) setForm({ ...form, image_url: url });
              }}
            >
              <Camera size={16} />
            </button>
          </div>

          {!editMode ? (
            <>
              <h2 className="mt-4 text-xl font-bold text-blue-700">{donor?.name}</h2>
              <p className="text-gray-600">{donor?.email}</p>

              <button
                className="mt-3 flex items-center gap-2 mx-auto text-blue-600 hover:underline"
                onClick={() => setEditMode(true)}
              >
                <Edit size={18} /> Edit Profile
              </button>
            </>
          ) : (
            <div className="space-y-3 mt-4">
              <input
                className="w-full border p-3 rounded-lg"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Full Name"
              />

              <input
                className="w-full border p-3 rounded-lg"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Phone Number"
              />

              <input
                className="w-full border p-3 rounded-lg"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Address"
              />

              <input
                className="w-full border p-3 rounded-lg"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="City"
              />

              <button
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold"
                onClick={updateProfile}
              >
                Save Changes
              </button>
            </div>
          )}
        </div>

        {/* Security */}
        <div className="border rounded-xl p-5 bg-gray-50">
          <h3 className="font-bold text-blue-700 flex items-center gap-2 mb-3">
            <Shield size={20} /> Security
          </h3>

          <button
            onClick={changePassword}
            className="w-full text-left bg-white border p-3 rounded-lg flex items-center gap-3 shadow-sm"
          >
            <KeyRound /> Change Password
          </button>
        </div>

        {/* Notifications */}
        <div className="border rounded-xl p-5 bg-gray-50">
          <h3 className="font-bold text-blue-700 flex items-center gap-2 mb-3">
            <Bell size={20} /> Notifications
          </h3>

          <div className="space-y-2">
            <Toggle label="Donation updates" />
            <Toggle label="NGO messages" />
            <Toggle label="Campaign alerts" />
          </div>
        </div>

        {/* Theme */}
        <div className="border rounded-xl p-5 bg-gray-50">
          <h3 className="font-bold text-blue-700 flex items-center gap-2 mb-3">
            <Palette size={20} /> Appearance
          </h3>

          <select className="w-full border p-3 rounded-lg">
            <option>Light</option>
            <option>Dark</option>
            <option>System</option>
          </select>
        </div>

        {/* Danger Zone */}
        <div className="border rounded-xl p-5 bg-red-50">
          <h3 className="font-bold text-red-700 flex items-center gap-2 mb-3">
            <Trash2 size={20} /> Danger Zone
          </h3>

          <button
            onClick={deleteAccount}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700"
          >
            Delete My Account
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full bg-gray-800 text-white py-3 rounded-lg flex items-center justify-center gap-2"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );
};

// Simple toggle UI component
const Toggle = ({ label }: any) => {
  const [enabled, setEnabled] = useState(true);

  return (
    <div
      className="flex items-center justify-between bg-white p-3 border rounded-lg shadow-sm cursor-pointer"
      onClick={() => setEnabled(!enabled)}
    >
      <span>{label}</span>
      <div
        className={`w-10 h-5 rounded-full p-1 ${
          enabled ? "bg-blue-600" : "bg-gray-300"
        }`}
      >
        <div
          className={`w-4 h-4 bg-white rounded-full transform ${
            enabled ? "translate-x-5" : ""
          }`}
        ></div>
      </div>
    </div>
  );
};

export default DonorSettings;
