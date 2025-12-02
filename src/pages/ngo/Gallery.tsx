import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Trash, ImagePlus, Loader2, X } from "lucide-react";

export default function NGOGallery() {
  const ngo = JSON.parse(localStorage.getItem("user") || "{}");

  const [gallery, setGallery] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

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

    setLoading(true);
    const ext = file.name.split(".").pop();
    const fileName = `${ngo.id}-${Date.now()}.${ext}`;

    const { data: storageData, error } = await supabase.storage
      .from("ngo_gallery_images")
      .upload(fileName, file);

    if (error) {
      alert("Upload failed!");
      setLoading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("ngo_gallery_images")
      .getPublicUrl(storageData.path);

    await supabase.from("ngo_gallery").insert({
      ngo_id: ngo.id,
      media_url: urlData.publicUrl,
      media_type: file.type.startsWith("video") ? "video" : "image",
      title,
      description,
    });

    setFile(null);
    setTitle("");
    setDescription("");
    fetchGallery();
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("ngo_gallery").delete().eq("id", id);
    setDeleteConfirm(null);
    fetchGallery();
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-700 mb-6 flex items-center gap-2">
        <ImagePlus className="text-blue-700" /> NGO Gallery
      </h1>

      {/* UPLOAD SECTION */}
      <div className="bg-white p-6 rounded-xl shadow mb-10">
        <h2 className="text-xl font-semibold mb-3">Upload New Media</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Title (optional)"
            className="border p-3 rounded-lg"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => {
              setFile(e.target.files?.[0] || null);
              if (e.target.files?.[0]) {
                setPreview(URL.createObjectURL(e.target.files[0]));
              }
            }}
            className="border p-3 rounded-lg"
          />
        </div>

        <textarea
          placeholder="Description (optional)"
          className="border p-3 rounded-lg w-full mt-3"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {preview && (
          <div className="mt-4 relative w-48 h-48">
            <img
              src={preview}
              className="w-full h-full object-cover rounded-lg"
            />
            <button
              onClick={() => setPreview(null)}
              className="absolute top-2 right-2 bg-black/60 p-1 rounded-full text-white"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <button
          onClick={handleUpload}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          disabled={loading}
        >
          {loading ? <Loader2 className="animate-spin" /> : <Upload size={18} />}
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {/* GALLERY DISPLAY */}
      <div className="grid md:grid-cols-3 gap-6">
        {gallery.map((item) => (
          <div
            key={item.id}
            className="relative rounded-xl overflow-hidden border shadow"
          >
            {item.media_type === "image" ? (
              <img
                src={item.media_url}
                className="w-full h-56 object-cover"
                alt=""
              />
            ) : (
              <video
                src={item.media_url}
                controls
                className="w-full h-56 object-cover"
              ></video>
            )}

            <div className="p-3">
              <h3 className="font-semibold">{item.title || "Untitled"}</h3>
              <p className="text-sm text-gray-600">
                {item.description || "No description"}
              </p>
            </div>

            {/* DELETE BUTTON */}
            <button
              onClick={() => setDeleteConfirm(item.id)}
              className="absolute top-3 right-3 bg-red-600 text-white p-2 rounded-full shadow"
            >
              <Trash size={16} />
            </button>

            {/* DELETE CONFIRMATION POPUP */}
            {deleteConfirm === item.id && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="bg-white p-4 rounded-lg text-center">
                  <p className="mb-3 font-semibold">Delete this media?</p>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-4 py-2 bg-gray-300 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {gallery.length === 0 && (
        <p className="text-center text-gray-500 text-lg mt-10">
          No media uploaded yet.
        </p>
      )}
    </div>
  );
}
