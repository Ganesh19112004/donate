import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Trash } from "lucide-react";

const NGOGallery = () => {
  const [gallery, setGallery] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const ngo = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchGallery = async () => {
    const { data } = await supabase
      .from("ngo_gallery")
      .select("*")
      .eq("ngo_id", ngo.id)
      .order("created_at", { ascending: false });
    setGallery(data || []);
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleUpload = async () => {
    if (!file) return alert("Select a file first!");
    const fileName = `${ngo.id}-${Date.now()}`;
    const { data, error } = await supabase.storage
      .from("ngo_gallery_images")
      .upload(fileName, file);
    if (error) return alert("Error uploading!");

    const { data: urlData } = supabase.storage
      .from("ngo_gallery_images")
      .getPublicUrl(data.path);

    await supabase.from("ngo_gallery").insert({
      ngo_id: ngo.id,
      media_url: urlData.publicUrl,
      media_type: "image",
    });
    fetchGallery();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("ngo_gallery").delete().eq("id", id);
    fetchGallery();
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-700 mb-4">📸 NGO Gallery</h1>

      <div className="flex gap-3 mb-6">
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button
          onClick={handleUpload}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          <Upload size={18} className="inline mr-1" /> Upload
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {gallery.map((img) => (
          <div
            key={img.id}
            className="relative border rounded-lg overflow-hidden group"
          >
            <img
              src={img.media_url}
              alt="Gallery"
              className="w-full h-48 object-cover"
            />
            <button
              onClick={() => handleDelete(img.id)}
              className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100"
            >
              <Trash size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NGOGallery;
