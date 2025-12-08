import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  itemCount: number;
  urgency: "high" | "medium" | "low";
}

const CategoryCard = ({ title, description, icon: Icon, itemCount, urgency }: CategoryCardProps) => {
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
      className={`h-full cursor-pointer border rounded-2xl bg-white/95 backdrop-blur-xl ${urgencyColors[urgency]}`}
      style={{
        boxShadow: "0 25px 70px rgba(0,0,0,0.35)",
      }}
    >
      <CardContent className="p-6 h-full flex flex-col">
        {/* ICON */}
        <div className="p-3 rounded-lg bg-primary/10 shadow-inner w-fit mb-2">
          <Icon className="h-8 w-8 text-primary" />
        </div>

        {/* BADGE */}
        <span
          className={`block w-fit mt-1 px-2 py-1 rounded-full text-xs font-medium shadow ${urgencyBadges[urgency]}`}
        >
          {itemCount} needed
        </span>

        <h3 className="font-bold text-xl mt-4 mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed flex-1">
          {description}
        </p>

        <div className="mt-6 pt-4 border-t border-border flex justify-between text-sm">
          <span className="text-muted-foreground">Urgency</span>
          <span className="font-semibold capitalize">{urgency}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryCard;
