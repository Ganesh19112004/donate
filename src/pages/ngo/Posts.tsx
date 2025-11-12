import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trash } from "lucide-react";

const NGOPosts = () => {
  const ngo = JSON.parse(localStorage.getItem("user") || "{}");
  const [posts, setPosts] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("ngo_posts")
      .select("*")
      .eq("ngo_id", ngo.id)
      .order("created_at", { ascending: false });
    setPosts(data || []);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePost = async () => {
    if (!title.trim()) return alert("Enter title");
    await supabase
      .from("ngo_posts")
      .insert({ ngo_id: ngo.id, title, content });
    setTitle("");
    setContent("");
    fetchPosts();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("ngo_posts").delete().eq("id", id);
    fetchPosts();
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-700 mb-4">📢 Announcements</h1>

      <div className="bg-white p-5 rounded-lg shadow mb-6 space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post Title"
          className="w-full border rounded p-3"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Post Content"
          rows={3}
          className="w-full border rounded p-3"
        />
        <button
          onClick={handlePost}
          className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
        >
          Post Update
        </button>
      </div>

      {posts.length === 0 ? (
        <p>No announcements yet.</p>
      ) : (
        <div className="space-y-4">
          {posts.map((p) => (
            <div key={p.id} className="bg-white border rounded-lg p-4 shadow">
              <div className="flex justify-between">
                <h2 className="font-bold text-lg">{p.title}</h2>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash size={16} />
                </button>
              </div>
              <p className="text-gray-700 mt-2">{p.content}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(p.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NGOPosts;
