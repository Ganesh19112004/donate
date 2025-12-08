import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
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
        { event: "*", schema: "public", table: "ngo_volunteers" },
        () => loadTopNGOs()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ngos" },
        () => loadTopNGOs()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const loadTopNGOs = async () => {
    const { data } = await supabase
      .from("ngos")
      .select(`
        id,
        name,
        city,
        state,
        description,
        verified,
        rating,
        total_reviews,
        image_url
      `)
      .order("verified", { ascending: false })
      .order("rating", { ascending: false })
      .order("total_reviews", { ascending: false })
      .limit(3);

    let result = data || [];

    const finalList = [];
    for (const ngo of result) {
      const { count } = await supabase
        .from("ngo_volunteers")
        .select("volunteer_id", { count: "exact", head: true })
        .eq("ngo_id", ngo.id);

      finalList.push({
        ...ngo,
        volunteer_count: count || 0,
      });
    }

    if (finalList.length < 3) {
      const placeholders = [
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
          description: "Healthcare & hygiene support for the poor.",
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
          description: "Food, clothing & shelter for homeless families.",
          city: "Bangalore",
          verified: true,
          rating: 4.9,
          total_reviews: 75,
          volunteer_count: 26,
          image_url: warmShelterImage,
          id: "placeholder-3",
        },
      ];

      finalList.push(...placeholders.slice(finalList.length));
    }

    const withImages = finalList.map((ngo, index) => ({
      ...ngo,
      image_url: ngo.image_url || fallbackImages[index],
    }));

    setNgos(withImages);
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
      className="py-20"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      variants={staggerContainer}
    >
      <div className="container mx-auto px-4">

        {/* Heading */}
        <motion.div variants={fadeUp} className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            🌟 Featured NGOs
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore India's top-rated, verified NGOs making real impact.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={staggerContainer}
        >
          {ngos.map((ngo) => (
            <motion.div
              key={ngo.id}
              variants={fadeUp}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 120 }}
            >
              <NGOCard
                name={ngo.name}
                location={ngo.city}
                description={ngo.description}
                image={ngo.image_url}
                verified={ngo.verified}
                rating={ngo.rating}
                reviews={ngo.total_reviews}
                volunteers={ngo.volunteer_count}
                focus={ngo.rating >= 4.5 ? "Top Rated" : "Trusted NGO"}
                needs={[]}
                onClick={() => handleClick(ngo)}
              />
            </motion.div>
          ))}
        </motion.div>

      </div>
    </motion.section>
  );
}
