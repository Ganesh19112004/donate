import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NGOProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const ngo = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("ngos")
        .select("*")
        .eq("id", ngo.id)
        .single();
      setProfile(data || {});
    };
    fetchProfile();
  }, []);

  const handleChange = (e: any) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    let imageUrl = profile.image_url;
    if (imageFile) {
      const fileName = `${ngo.id}-${Date.now()}`;
      const { data, error } = await supabase.storage
        .from("ngo_images")
        .upload(fileName, imageFile);
      if (!error) {
        const { data: publicUrl } = supabase.storage
          .from("ngo_images")
          .getPublicUrl(data.path);
        imageUrl = publicUrl.publicUrl;
      }
    }

    const { error } = await supabase
      .from("ngos")
      .update({ ...profile, image_url: imageUrl })
      .eq("id", ngo.id);

    if (error) alert("❌ Error saving profile");
    else alert("✅ Profile updated!");
  };

  return (
    <div className="p-8 max-w-3xl mx-auto bg-white rounded-xl shadow">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 flex items-center gap-1"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <h1 className="text-2xl font-bold text-blue-700">NGO Profile</h1>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col items-center">
          <img
            src={previewUrl || profile.image_url || "/placeholder.png"}
            alt="Logo"
            className="w-28 h-28 rounded-full object-cover border mb-2"
          />
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>

        <input
          name="name"
          value={profile.name || ""}
          onChange={handleChange}
          placeholder="NGO Name"
          className="w-full border rounded p-3"
        />
        <textarea
          name="description"
          value={profile.description || ""}
          onChange={handleChange}
          placeholder="About your NGO"
          className="w-full border rounded p-3"
          rows={3}
        />
        <input
          name="city"
          value={profile.city || ""}
          onChange={handleChange}
          placeholder="City"
          className="w-full border rounded p-3"
        />
        <input
          name="website"
          value={profile.website || ""}
          onChange={handleChange}
          placeholder="Website"
          className="w-full border rounded p-3"
        />
        <input
          name="phone"
          value={profile.phone || ""}
          onChange={handleChange}
          placeholder="Contact Number"
          className="w-full border rounded p-3"
        />

        <button
          onClick={handleSave}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default NGOProfile;
