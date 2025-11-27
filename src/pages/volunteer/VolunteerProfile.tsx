import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Save,
  Upload,
  Loader2,
  Phone,
  MapPin,
  User,
  BadgeCheck,
  FileText,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const VolunteerProfile = () => {
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [profile, setProfile] = useState<any>(storedUser);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { toast } = useToast();

  // Fetch profile from Supabase
  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("volunteers")
        .select(
          "id, name, email, city, phone, image_url, skills, bio, status"
        )
        .eq("id", storedUser.id)
        .single();

      if (data) {
        setProfile(data);
        localStorage.setItem("user", JSON.stringify(data));
      }
    };

    fetchProfile();
  }, []);

  // Upload Profile Photo
  const handleImageUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const filePath = `volunteers/${profile.id}/${file.name}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (error) {
      toast({
        title: "Upload Failed",
        variant: "destructive",
      });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    await supabase
      .from("volunteers")
      .update({ image_url: urlData.publicUrl })
      .eq("id", profile.id);

    setProfile({ ...profile, image_url: urlData.publicUrl });
    localStorage.setItem(
      "user",
      JSON.stringify({ ...profile, image_url: urlData.publicUrl })
    );

    toast({ title: "Profile Picture Updated" });
    setUploading(false);
  };

  // Save Profile
  const handleSave = async () => {
    setSaving(true);

    const { error } = await supabase
      .from("volunteers")
      .update({
        name: profile.name,
        phone: profile.phone,
        city: profile.city,
        skills: profile.skills,
        bio: profile.bio,
        status: profile.status,
      })
      .eq("id", profile.id);

    setSaving(false);

    if (error) {
      toast({
        title: "Update Failed",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem("user", JSON.stringify(profile));
    toast({ title: "Profile Updated Successfully" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 text-center">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-blue-100 text-sm mt-1">
            Update your volunteer information 💙
          </p>
        </div>

        {/* CONTENT */}
        <div className="p-8 flex flex-col items-center space-y-6">

          {/* PROFILE IMAGE */}
          <div className="relative">
            <img
              src={
                profile.image_url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  profile.name || "Volunteer"
                )}`
              }
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

          {/* FORM FIELDS */}
          <div className="w-full space-y-6 mt-4">

            {/* Name */}
            <InputField
              label="Name"
              icon={<User size={18} />}
              value={profile.name}
              onChange={(val: any) => setProfile({ ...profile, name: val })}
            />

            {/* City */}
            <InputField
              label="City"
              icon={<MapPin size={18} />}
              value={profile.city}
              onChange={(val: any) => setProfile({ ...profile, city: val })}
            />

            {/* Phone */}
            <InputField
              label="Phone"
              icon={<Phone size={18} />}
              value={profile.phone}
              onChange={(val: any) => setProfile({ ...profile, phone: val })}
            />

            {/* Status */}
            <div>
              <label className="block text-gray-700 font-medium flex items-center gap-2">
                <BadgeCheck size={18} /> Availability Status
              </label>
              <select
                value={profile.status || "Available"}
                onChange={(e) =>
                  setProfile({ ...profile, status: e.target.value })
                }
                className="w-full border rounded-lg px-4 py-2 mt-1 focus:ring-2 focus:ring-blue-500"
              >
                <option>Available</option>
                <option>Busy</option>
                <option>Offline</option>
              </select>
            </div>

            {/* Skills */}
            <InputField
              label="Skills (comma separated)"
              icon={<FileText size={18} />}
              value={profile.skills}
              placeholder="First Aid, Teaching, Cooking"
              onChange={(val: any) => setProfile({ ...profile, skills: val })}
            />

            {/* Bio */}
            <div>
              <label className="block text-gray-700 font-medium flex items-center gap-2">
                <FileText size={18} /> Bio
              </label>
              <textarea
                value={profile.bio || ""}
                onChange={(e) =>
                  setProfile({ ...profile, bio: e.target.value })
                }
                placeholder="Tell NGOs about your experience..."
                className="w-full border rounded-lg px-4 py-2 mt-1 focus:ring-2 focus:ring-blue-500 h-28"
              />
            </div>

            {/* SAVE BUTTON */}
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
          </div>
        </div>
      </div>
    </div>
  );
};

/* 🔹 Reusable Input Field Component */
const InputField = ({ label, icon, value, onChange, placeholder = "" }: any) => (
  <div>
    <label className="block text-gray-700 font-medium flex items-center gap-2">
      {icon} {label}
    </label>
    <input
      value={value || ""}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border rounded-lg px-4 py-2 mt-1 focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

export default VolunteerProfile;
