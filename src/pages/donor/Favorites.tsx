import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Favorites = () => {
  const [favorites, setFavorites] = useState<any[]>([]);

  useEffect(() => {
    const donor = JSON.parse(localStorage.getItem("user") || "{}");
    const loadFavorites = async () => {
      const { data } = await supabase
        .from("favorite_ngos")
        .select("ngo_id, ngos(name, city)")
        .eq("donor_id", donor.id);
      setFavorites(data || []);
    };
    loadFavorites();
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">My Favorite NGOs</h1>
      <ul className="space-y-3">
        {favorites.map((f, i) => (
          <li key={i} className="bg-white p-4 shadow rounded-lg">
            {f.ngos?.name} - {f.ngos?.city}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Favorites;
