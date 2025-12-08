import CategoryCard from "./CategoryCard";
import {
  Shirt,
  Book,
  Stethoscope,
  Home,
  Banknote,
  Package,
} from "lucide-react";

const CategoriesSection = () => {
  const categories = [
    {
      title: "Clothing",
      description:
        "Donate clothes, shoes, and accessories for people in need across different age groups.",
      icon: Shirt,
      itemCount: 150,
      urgency: "medium",
    },
    {
      title: "Education Supplies",
      description:
        "Books, stationery, school bags, and learning materials for underprivileged children.",
      icon: Book,
      itemCount: 280,
      urgency: "high",
    },
    {
      title: "Healthcare & Hygiene",
      description:
        "Medicines, sanitary kits, first aid supplies, and personal hygiene products.",
      icon: Stethoscope,
      itemCount: 95,
      urgency: "high",
    },
    {
      title: "Shelter Support",
      description:
        "Blankets, mattresses, tents, and essential items for housing support.",
      icon: Home,
      itemCount: 67,
      urgency: "medium",
    },
    {
      title: "Financial Contributions",
      description:
        "Direct monetary donations to help NGOs fund their ongoing projects and operations.",
      icon: Banknote,
      itemCount: 45,
      urgency: "low",
    },
    {
      title: "Other Essentials",
      description:
        "Kitchen utensils, tools, electronics, and other miscellaneous items needed by communities.",
      icon: Package,
      itemCount: 123,
      urgency: "low",
    },
  ];

  return (
    <div className="banner">
      {/* TITLE */}
      <div className="text-center mb-12 z-10 relative">
        <h2 className="text-4xl font-bold mb-4">Donation Categories</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Choose from various categories and donate.
        </p>
      </div>

      {/* MAIN ROTATING SLIDER */}
      <div
        className="slider"
        style={{ ["--quantity" as any]: categories.length }}
      >
        {categories.map((cat, index) => (
          <div
            key={index}
            className="item"
            style={{ ["--position" as any]: index + 1 }}
          >
            <CategoryCard
              title={cat.title}
              description={cat.description}
              icon={cat.icon}
              itemCount={cat.itemCount}
              urgency={cat.urgency as any}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesSection;
