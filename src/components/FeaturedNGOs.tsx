import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import NGOCard from "./NGOCard";
import { motion } from "framer-motion";

import helpingHandsImage from "@/assets/ngo-helping-hands.jpg";
import care4healthImage from "@/assets/ngo-care4health.jpg";
import warmShelterImage from "@/assets/ngo-warm-shelter.jpg";

const fallbackImages = [
  helpingHandsImage,
  care4healthImage,
  warmShelterImage,
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.15,
    },
  },
};

export default function FeaturedNGOs() {
  const [ngos, setNgos] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadTopNGOs();

    const channel = supabase
      .channel("featured-ngos")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ngos" },
        () => loadTopNGOs()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ngo_volunteers" },
        () => loadTopNGOs()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  /* ---------------- LOAD FEATURED NGOs ---------------- */
  const loadTopNGOs = async () => {
    const { data } = await supabase
      .from("ngos")
      .select(`
        id,
        name,
        city,
        description,
        verified,
        rating,
        total_reviews,
        image_url,
        latitude,
        longitude,
        created_at
      `)
      .eq("verified", true);

    if (!data || data.length === 0) {
      setFallback();
      return;
    }

    let list = [...data];

    /* SMART PRIORITY SORT */
    list.sort((a: any, b: any) => {
      const ratingA = a.rating ?? 0;
      const ratingB = b.rating ?? 0;
      if (ratingA !== ratingB) return ratingB - ratingA;

      const score = (ngo: any) => {
        let s = 0;
        if (ngo.city) s++;
        if (ngo.description) s++;
        if (ngo.image_url) s++;
        if (ngo.latitude && ngo.longitude) s++;
        if (ngo.total_reviews > 0) s++;
        return s;
      };

      const scoreA = score(a);
      const scoreB = score(b);
      if (scoreA !== scoreB) return scoreB - scoreA;

      return (
        new Date(a.created_at).getTime() -
        new Date(b.created_at).getTime()
      );
    });

    const topThree = list.slice(0, 3);

    const enriched = await Promise.all(
      topThree.map(async (ngo) => {
        const { count } = await supabase
          .from("ngo_volunteers")
          .select("volunteer_id", { count: "exact", head: true })
          .eq("ngo_id", ngo.id);

        return {
          ...ngo,
          volunteer_count: count || 0,
        };
      })
    );

    const withImages = enriched.map((ngo, index) => ({
      ...ngo,
      image_url: ngo.image_url || fallbackImages[index],
    }));

    setNgos(withImages);
  };

  /* ---------------- FALLBACK ---------------- */
  const setFallback = () => {
    setNgos([
      {
        name: "Helping Hands Foundation",
        description: "Committed to providing education support.",
        city: "Mumbai",
        verified: true,
        rating: 5,
        total_reviews: 120,
        volunteer_count: 54,
        image_url: helpingHandsImage,
        id: "placeholder-1",
      },
      {
        name: "Care4Health Trust",
        description: "Healthcare & hygiene support.",
        city: "Delhi",
        verified: true,
        rating: 4.8,
        total_reviews: 89,
        volunteer_count: 31,
        image_url: care4healthImage,
        id: "placeholder-2",
      },
      {
        name: "Warm Shelter NGO",
        description: "Food & shelter for homeless families.",
        city: "Bangalore",
        verified: true,
        rating: 4.9,
        total_reviews: 75,
        volunteer_count: 26,
        image_url: warmShelterImage,
        id: "placeholder-3",
      },
    ]);
  };

  const handleClick = (ngo: any) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!user?.role || user.role !== "donor") {
      navigate("/auth?role=donor&redirect=/ngo/" + ngo.id);
      return;
    }

    navigate("/ngo/" + ngo.id);
  };

  return (
    <motion.section
      className="py-20 bg-white relative z-10"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      variants={staggerContainer}
    >
      <div className="container mx-auto px-4 min-h-[350px]">

        {/* Heading */}
        <motion.div variants={fadeUp} className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-gray-900">
            🌟 Featured NGOs
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            India’s most trusted & impactful verified NGOs.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-20"
          variants={staggerContainer}
        >
          {ngos.length === 0 ? (
            <div className="col-span-3 text-center text-gray-500">
              No NGOs available yet.
            </div>
          ) : (
            ngos.map((ngo) => (
              <motion.div
                key={ngo.id}
                variants={fadeUp}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 120 }}
              >
                <div className="bg-white shadow-lg rounded-xl overflow-hidden border">
                  <NGOCard
                    name={ngo.name}
                    location={ngo.city}
                    description={ngo.description}
                    image={ngo.image_url}
                    verified={ngo.verified}
                    rating={ngo.rating ?? 0}
                    reviews={ngo.total_reviews ?? 0}
                    volunteers={ngo.volunteer_count}
                    focus={
                      ngo.rating >= 4.7
                        ? "⭐ Elite NGO"
                        : ngo.total_reviews > 50
                        ? "🔥 Popular NGO"
                        : "Trusted NGO"
                    }
                    needs={[]}
                    onClick={() => handleClick(ngo)}
                  />
                </div>
              </motion.div>
            ))
          )}
        </motion.div>

      </div>
    </motion.section>
  );
}
