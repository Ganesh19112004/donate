import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft } from "lucide-react";

const NGOProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [ngo, setNgo] = useState<any>(null);
  const [impact, setImpact] = useState<any[]>([]);
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const { data: ngoData, error } = await supabase.from("ngos").select("*, ngo_profiles(*)").eq("id", id).single();
      if (error) { console.error(error); setLoading(false); return; }
      setNgo(ngoData);

      const { data: stories } = await supabase.from("impact_stories").select("*").eq("donation_id", id).order("created_at", { ascending: false });
      setImpact(stories || []);

      const storedUser = localStorage.getItem("user");
      const storedRole = localStorage.getItem("role");
      if (storedUser && storedRole === "donor") {
        const user = JSON.parse(storedUser);
        const { data: fav } = await supabase.from("favorites").select("*").eq("donor_id", user.id).eq("ngo_id", id).single();
        setIsFav(!!fav);
      }

      setLoading(false);
    })();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!ngo) return <div className="p-8">NGO not found.</div>;

  const toggleFav = async () => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return alert("Login as donor to favorite NGOs.");
    const user = JSON.parse(storedUser);
    try {
      if (isFav) {
        await supabase.from("favorites").delete().eq("donor_id", user.id).eq("ngo_id", id);
        setIsFav(false);
      } else {
        await supabase.from("favorites").insert({ donor_id: user.id, ngo_id: id });
        setIsFav(true);
      }
    } catch (err: any) {
      alert("Failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-6">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">{ngo.name}</h1>
            <p className="text-sm text-gray-600">{ngo.ngo_profiles?.description || ngo.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleFav} className={`px-3 py-2 rounded ${isFav ? "bg-red-100 text-red-700" : "bg-blue-50 text-blue-700"}`}>
              {isFav ? "♥ Favorited" : "♡ Favorite"}
            </button>
            <Link to="/donor/view-ngos" className="text-blue-600 hover:underline"><ArrowLeft size={14}/> Back</Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-2">
            <h3 className="font-semibold">Contact</h3>
            <p className="text-sm">{ngo.email}</p>
            <p className="text-sm">{ngo.ngo_profiles?.location}</p>
          </div>

          <div>
            <h3 className="font-semibold">Causes</h3>
            <p className="text-sm">{ngo.ngo_profiles?.cause || "General"}</p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Impact Gallery</h3>
          {impact.length === 0 ? (
            <p className="text-gray-500">No images yet.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {impact.map((s: any) => (
                <img key={s.id} src={s.image_url} alt={s.caption} className="w-full h-32 object-cover rounded" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NGOProfile;
