import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Star,
  HeartHandshake,
  Users,
  Package,
  MapPin,
} from "lucide-react";

export default function ImpactStories() {
  const [stories, setStories] = useState([]);
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalNGOs: 0,
    totalDonors: 0,
    totalVolunteers: 0,
    totalCities: 0,
    topCategory: "N/A",
  });

  useEffect(() => {
    loadImpactData();
  }, []);

  const loadImpactData = async () => {
    // 1️⃣ Fetch COMPLETED Donations (Impact Stories)
    const { data: donationData } = await supabase
      .from("donations")
      .select(
        `
        id,
        category,
        description,
        image_url,
        created_at,
        status,
        ngo_feedback,
        donor_rating,
        ngos(name, city, image_url)
      `
      )
      .eq("status", "Completed")
      .order("created_at", { ascending: false });

    setStories(donationData || []);

    // 2️⃣ GLOBAL STATS (Similar to HeroSection but optimized)

    const [{ data: allDonations }, { data: ngos }, { data: donors }, { data: volunteers }] =
      await Promise.all([
        supabase.from("donations").select("id"), 
        supabase.from("ngos").select("id, city"),
        supabase.from("donors").select("id"),
        supabase.from("volunteers").select("id") 
      ]);

    // Unique cities
    const uniqueCities =
      ngos?.reduce((set, ngo) => {
        if (ngo.city) set.add(ngo.city.trim().toLowerCase());
        return set;
      }, new Set()) || new Set();

    // 3️⃣ MOST DONATED CATEGORY
    const categoryFrequency: any = {};

    donationData?.forEach((d) => {
      if (!d.category) return;
      categoryFrequency[d.category] = (categoryFrequency[d.category] || 0) + 1;
    });

    const topCategory =
      Object.keys(categoryFrequency).sort(
        (a, b) => categoryFrequency[b] - categoryFrequency[a]
      )[0] || "N/A";

    // 4️⃣ SET FINAL STATS
    setStats({
      totalDonations: donationData?.length || 0, // Only COMPLETED donations count as impact
      totalNGOs: ngos?.length || 0,
      totalDonors: donors?.length || 0,
      totalVolunteers: volunteers?.length || 0,
      totalCities: uniqueCities.size || 0,
      topCategory,
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
          Real moments of kindness—powered by donors, volunteers, and NGOs working together.
        </p>

        {/* GLOBAL STATISTICS */}
        <div className="grid md:grid-cols-5 gap-6 mb-16">

          <Card className="text-center shadow-lg border-l-4 border-primary">
            <CardContent className="py-6">
              <Package className="mx-auto h-8 w-8 text-primary" />
              <p className="text-3xl font-bold mt-2">{stats.totalDonations}+</p>
              <p className="text-gray-600 text-sm">Completed Donations</p>
            </CardContent>
          </Card>

          <Card className="text-center shadow-lg border-l-4 border-primary">
            <CardContent className="py-6">
              <Users className="mx-auto h-8 w-8 text-primary" />
              <p className="text-3xl font-bold mt-2">{stats.totalDonors}+</p>
              <p className="text-gray-600 text-sm">Donors</p>
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
              <Users className="mx-auto h-8 w-8 text-primary" />
              <p className="text-3xl font-bold mt-2">{stats.totalVolunteers}+</p>
              <p className="text-gray-600 text-sm">Volunteers</p>
            </CardContent>
          </Card>

          <Card className="text-center shadow-lg border-l-4 border-primary">
            <CardContent className="py-6">
              <MapPin className="mx-auto h-8 w-8 text-primary" />
              <p className="text-2xl font-bold mt-2 capitalize">{stats.topCategory}</p>
              <p className="text-gray-600 text-sm">Top Donation Category</p>
            </CardContent>
          </Card>
        </div>

        {/* IMPACT STORY CARDS */}
        <div className="grid md:grid-cols-2 gap-8">
          {stories.length === 0 && (
            <p className="text-center text-gray-500 col-span-2">
              No impact stories yet.
            </p>
          )}

          {stories.map((story) => (
            <Card
              key={story.id}
              className="shadow-lg hover:shadow-xl transition-all border border-gray-200 rounded-lg"
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
                <p>{story.description || "A generous donation made a meaningful impact."}</p>

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

        <div className="mb-24"></div>
      </div>
    </div>
  );
}
