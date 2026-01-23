import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  itemCount: number;
  urgency: "high" | "medium" | "low";
}

const CategoryCard = ({
  title,
  description,
  icon: Icon,
  itemCount,
  urgency,
}: CategoryCardProps) => {
  const urgencyColors = {
    high: "border-destructive bg-destructive/5",
    medium: "border-secondary bg-secondary-light",
    low: "border-accent bg-accent",
  };

  const urgencyBadges = {
    high: "bg-destructive text-destructive-foreground",
    medium: "bg-secondary text-secondary-foreground",
    low: "bg-accent-foreground text-accent",
  };

  return (
    <Card
      className={`
        h-full cursor-pointer border rounded-2xl
        bg-white/95 backdrop-blur-xl
        text-sm sm:text-base
        ${urgencyColors[urgency]}
      `}
      style={{
        boxShadow: "0 25px 70px rgba(0,0,0,0.35)",
        overflow: "hidden", // 🔒 Prevent text overflow on mobile
      }}
    >
      <CardContent className="p-4 sm:p-6 h-full flex flex-col">
        {/* ICON */}
        <div className="p-2 sm:p-3 rounded-lg bg-primary/10 shadow-inner w-fit mb-2">
          <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
        </div>

        {/* BADGE */}
        <span
          className={`
            block w-fit mt-1 px-2 py-1 rounded-full
            text-xs font-medium shadow
            ${urgencyBadges[urgency]}
          `}
        >
          {itemCount} needed
        </span>

        {/* TITLE */}
        <h3 className="font-bold text-base sm:text-xl mt-3 mb-1 leading-tight">
          {title}
        </h3>

        {/* DESCRIPTION */}
        <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed line-clamp-3">
          {description}
        </p>

        {/* FOOTER (hide on very small screens if needed) */}
        <div className="mt-auto pt-3 border-t border-border flex justify-between text-xs sm:text-sm">
          <span className="text-muted-foreground">Urgency</span>
          <span className="font-semibold capitalize">{urgency}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryCard;
