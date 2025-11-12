import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Edit2, Save, Upload } from "lucide-react";

const DonorProfile = () => {
  const [donor, setDonor] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      setDonor(parsed);
      setPreview(parsed.image_url || null);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDonor({ ...donor, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !donor?.id) return;
    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${donor.id}-${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from("profile_images")
        .upload(fileName, file, { upsert: true });

      if (error) throw error;

      const { data: publicUrl } = supabase.storage
        .from("profile_images")
        .getPublicUrl(data.path);

      const imageUrl = publicUrl.publicUrl;

      // Update in Supabase
      const { error: updateError } = await supabase
        .from("donors")
        .update({ image_url: imageUrl })
        .eq("id", donor.id);

      if (updateError) throw updateError;

      const updated = { ...donor, image_url: imageUrl };
      setDonor(updated);
      localStorage.setItem("user", JSON.stringify(updated));
      setPreview(imageUrl);
      alert("✅ Profile image updated!");
    } catch (err: any) {
      alert("❌ Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from("donors")
        .update({
          name: donor.name,
          city: donor.city || null,
        })
        .eq("id", donor.id);

      if (error) throw error;

      localStorage.setItem("user", JSON.stringify(donor));
      alert("✅ Profile updated successfully!");
      setEditMode(false);
    } catch (err: any) {
      alert("❌ Update failed: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold"
        >
          <ArrowLeft size={20} /> Back
        </button>
        <h1 className="text-3xl font-extrabold text-blue-700">My Profile</h1>
      </div>

      {donor ? (
        <div className="bg-white shadow-lg border border-gray-200 rounded-2xl p-8 w-full max-w-2xl">
          {/* Profile Picture */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <img
                src={
                  preview ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                }
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 shadow-md"
              />
              <label
                htmlFor="upload"
                className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700"
              >
                <Upload size={16} />
              </label>
              <input
                id="upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            {uploading && <p className="text-sm text-blue-600 mt-2">Uploading...</p>}
          </div>

          {/* Profile Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={donor.name}
                disabled={!editMode}
                onChange={handleChange}
                className={`w-full border rounded-lg p-3 ${
                  editMode
                    ? "border-blue-400 focus:ring-2 focus:ring-blue-300"
                    : "bg-gray-100 cursor-not-allowed"
                }`}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Email</label>
              <input
                type="email"
                value={donor.email}
                disabled
                className="w-full border rounded-lg p-3 bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">City</label>
              <input
                type="text"
                name="city"
                value={donor.city || ""}
                disabled={!editMode}
                onChange={handleChange}
                placeholder="Enter your city"
                className={`w-full border rounded-lg p-3 ${
                  editMode
                    ? "border-blue-400 focus:ring-2 focus:ring-blue-300"
                    : "bg-gray-100 cursor-not-allowed"
                }`}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end mt-6 gap-4">
            {editMode ? (
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
              >
                <Save size={18} /> Save
              </button>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
              >
                <Edit2 size={18} /> Edit
              </button>
            )}
          </div>
        </div>
      ) : (
        <p>Loading profile...</p>
      )}
    </div>
  );
};

export default DonorProfile;
