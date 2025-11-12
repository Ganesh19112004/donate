import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Save, Upload, Loader2, Phone, MapPin, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const VolunteerProfile = () => {
  const volunteer = JSON.parse(localStorage.getItem("user") || "{}");
  const [profile, setProfile] = useState<any>(volunteer);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const { toast } = useToast();

  // ✅ Fetch latest profile from Supabase
  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("volunteers")
        .select("id, name, email, city, phone, image_url, created_at")
        .eq("id", volunteer.id)
        .single();

      if (data) {
        setProfile(data);
        localStorage.setItem("user", JSON.stringify(data));
      }
    };
    fetchProfile();
  }, [volunteer.id]);

  // ✅ Handle image upload
  const handleImageUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const filePath = `volunteers/${volunteer.id}/${file.name}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (!error) {
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      await supabase
        .from("volunteers")
        .update({ image_url: urlData.publicUrl })
        .eq("id", volunteer.id);

      setProfile({ ...profile, image_url: urlData.publicUrl });
      localStorage.setItem(
        "user",
        JSON.stringify({ ...profile, image_url: urlData.publicUrl })
      );

      toast({ title: "✅ Profile picture updated successfully!" });
    } else {
      toast({
        title: "❌ Upload failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
    setUploading(false);
  };

  // ✅ Handle Save Profile
  const handleSave = async () => {
    setSaving(true);

    const { error } = await supabase
      .from("volunteers")
      .update({
        name: profile.name,
        city: profile.city,
        phone: profile.phone,
        updated_at: new Date(),
      })
      .eq("id", volunteer.id);

    if (!error) {
      localStorage.setItem("user", JSON.stringify(profile));
      setLastUpdated(new Date().toLocaleString());
      toast({ title: "✅ Profile updated successfully!" });
    } else {
      toast({
        title: "❌ Update failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    }

    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* 🔹 Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 text-center">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-blue-100 text-sm mt-1">
            Manage your volunteer details and stay up to date 💙
          </p>
        </div>

        {/* 🧑 Profile Section */}
        <div className="p-8 flex flex-col items-center space-y-6">
          {/* Profile Image */}
          <div className="relative">
            <img
              src={
                profile.image_url ||
                "https://ui-avatars.com/api/?name=" +
                  encodeURIComponent(profile.name || "Volunteer")
              }
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-blue-100 shadow-md"
            />
            <label className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full cursor-pointer hover:bg-blue-700 transition">
              {uploading ? (
                <Loader2 size={16} className="animate-spin text-white" />
              ) : (
                <Upload size={16} className="text-white" />
              )}
              <input
                type="file"
                className="hidden"
                onChange={handleImageUpload}
                accept="image/*"
              />
            </label>
          </div>

          {/* Volunteer Info */}
          <div className="w-full space-y-5 mt-4">
            <div>
              <label className="block text-gray-700 font-medium flex items-center gap-2">
                <User size={18} /> Name
              </label>
              <input
                value={profile.name || ""}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
                className="w-full border rounded-lg px-4 py-2 mt-1 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium flex items-center gap-2">
                <MapPin size={18} /> City
              </label>
              <input
                value={profile.city || ""}
                onChange={(e) =>
                  setProfile({ ...profile, city: e.target.value })
                }
                className="w-full border rounded-lg px-4 py-2 mt-1 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium flex items-center gap-2">
                <Phone size={18} /> Phone
              </label>
              <input
                value={profile.phone || ""}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
                className="w-full border rounded-lg px-4 py-2 mt-1 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-blue-600 text-white py-3 rounded-lg flex justify-center items-center gap-2 hover:bg-blue-700 transition shadow-md"
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save size={18} /> Save Changes
                </>
              )}
            </button>

            {lastUpdated && (
              <p className="text-center text-gray-500 text-sm mt-2">
                Last updated on {lastUpdated}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerProfile;
