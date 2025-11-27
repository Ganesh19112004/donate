import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, HeartHandshake, Users, Package, MapPin } from "lucide-react";

export default function ImpactStories() {
  const [stories, setStories] = useState([]);
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalNGOs: 0,
    totalDonors: 0,
    topCategory: "",
  });

  useEffect(() => {
    loadImpactData();
  }, []);

  const loadImpactData = async () => {
    // 1️⃣ Fetch completed donations (impact stories)
    const { data: donationData } = await supabase
      .from("donations")
      .select(`
        id,
        category,
        description,
        image_url,
        ngo_id,
        donor_id,
        created_at,
        ngo_feedback,
        donor_rating,
        ngos(name, city, image_url)
      `)
      .eq("status", "Completed")
      .order("created_at", { ascending: false });

    setStories(donationData || []);

    // 2️⃣ Fetch global statistics
    const { data: ngoCount } = await supabase.from("ngos").select("id");
    const { data: donorCount } = await supabase.from("donors").select("id");
    const { data: totalDon } = await supabase
      .from("donations")
      .select("id", { count: "exact", head: true });

    // 3️⃣ Get most donated category
    const { data: categories } = await supabase
      .from("donations")
      .select("category");

    const freq = {};
    categories?.forEach((c) => {
      freq[c.category] = (freq[c.category] || 0) + 1;
    });

    const topCategory = Object.keys(freq).sort((a, b) => freq[b] - freq[a])[0];

    setStats({
      totalDonations: totalDon?.count || 0,
      totalNGOs: ngoCount?.length || 0,
      totalDonors: donorCount?.length || 0,
      topCategory: topCategory || "N/A",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 py-16 px-4">
      <div className="container mx-auto max-w-6xl">

        {/* HEADER */}
        <h1 className="text-4xl font-extrabold mb-4 text-center">
          🌟 Impact Stories
        </h1>
        <p className="text-lg text-center text-gray-600 mb-12">
          Real stories of kindness, change, and impact — made possible by donors like you.
        </p>

        {/* GLOBAL STATISTICS */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          <Card className="text-center shadow-lg border-l-4 border-primary">
            <CardContent className="py-6">
              <Package className="mx-auto h-8 w-8 text-primary" />
              <p className="text-3xl font-bold mt-2">{stats.totalDonations}+</p>
              <p className="text-gray-600 text-sm">Total Donations</p>
            </CardContent>
          </Card>

          <Card className="text-center shadow-lg border-l-4 border-primary">
            <CardContent className="py-6">
              <Users className="mx-auto h-8 w-8 text-primary" />
              <p className="text-3xl font-bold mt-2">{stats.totalDonors}+</p>
              <p className="text-gray-600 text-sm">Donors Joined</p>
            </CardContent>
          </Card>

          <Card className="text-center shadow-lg border-l-4 border-primary">
            <CardContent className="py-6">
              <HeartHandshake className="mx-auto h-8 w-8 text-primary" />
              <p className="text-3xl font-bold mt-2">{stats.totalNGOs}+</p>
              <p className="text-gray-600 text-sm">Partner NGOs</p>
            </CardContent>
          </Card>

          <Card className="text-center shadow-lg border-l-4 border-primary">
            <CardContent className="py-6">
              <MapPin className="mx-auto h-8 w-8 text-primary" />
              <p className="text-3xl font-bold mt-2">{stats.topCategory}</p>
              <p className="text-gray-600 text-sm">Most Donated Category</p>
            </CardContent>
          </Card>
        </div>

        {/* IMPACT STORY CARDS */}
        <div className="grid md:grid-cols-2 gap-8">
          {stories.length === 0 && (
            <p className="text-center text-gray-500">No impact stories yet.</p>
          )}

          {stories.map((story) => (
            <Card
              key={story.id}
              className="shadow-lg hover:shadow-xl transition-all border border-gray-200"
            >
              {/* IMAGE */}
              {story.image_url && (
                <img
                  src={story.image_url}
                  alt="Donation"
                  className="w-full h-60 object-cover rounded-t-lg"
                />
              )}

              <CardHeader>
                <CardTitle className="text-xl font-bold">
                  {story.category} Donation Impact
                </CardTitle>
                <p className="text-sm text-gray-500">
                  {story.ngos?.name} — {story.ngos?.city}
                </p>
              </CardHeader>

              <CardContent className="text-gray-600 space-y-3">
                <p>{story.description || "A generous donation made a difference."}</p>

                {story.ngo_feedback && (
                  <p className="text-primary font-medium italic">
                    “{story.ngo_feedback}”
                  </p>
                )}

                {story.donor_rating && (
                  <div className="flex items-center gap-1 text-yellow-500">
                    {[...Array(story.donor_rating)].map((_, i) => (
                      <Star key={i} size={18} fill="gold" />
                    ))}
                  </div>
                )}

                <p className="text-xs text-gray-400">
                  Date: {new Date(story.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FOOTER SPACING */}
        <div className="mb-24"></div>
      </div>
    </div>
  );
}
