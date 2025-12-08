import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Clock, Heart } from "lucide-react";
import { motion } from "framer-motion";

interface NGONeed {
  item: string;
  quantity: number;
  emoji: string;
}

interface NGOCardProps {
  name: string;
  location: string;
  focus: string;
  description: string;
  needs: NGONeed[];
  volunteers: number;
  image: string;
  verified: boolean;
  onClick?: () => void;
}

const NGOCard = ({
  name,
  location,
  focus,
  description,
  needs,
  volunteers,
  image,
  verified,
  onClick
}: NGOCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <Card className="overflow-hidden rounded-xl hover:shadow-xl transition-all">
        
        {/* 🔥 IMAGE AREA */}
        <div className="aspect-video relative overflow-hidden">
          <motion.img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.4 }}
          />

          {/* DARK GRADIENT */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

          {/* VERIFIED BADGE */}
          {verified && (
            <motion.div
              className="absolute top-4 left-4"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Badge className="bg-primary text-primary-foreground shadow-md">
                Verified NGO
              </Badge>
            </motion.div>
          )}

          {/* TITLE */}
          <div className="absolute bottom-4 left-4 text-white">
            <h3 className="font-bold text-lg">{name}</h3>
            <div className="flex items-center text-sm opacity-90">
              <MapPin className="h-4 w-4 mr-1" />
              {location}
            </div>
          </div>
        </div>

        {/* 🔥 CONTENT */}
        <CardContent className="p-5 space-y-4">

          <div className="flex items-center justify-between">
            <Badge variant="secondary">{focus}</Badge>
            <div className="flex items-center text-muted-foreground text-sm">
              <Users className="h-4 w-4 mr-1" />
              {volunteers} volunteers
            </div>
          </div>

          {/* DESCRIPTION */}
          <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
            {description}
          </p>

          {/* NEEDS */}
          <div className="space-y-2">

            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Current Needs</h4>
              <div className="flex items-center text-muted-foreground text-xs">
                <Clock className="h-3 w-3 mr-1" />
                Updated today
              </div>
            </div>

            {/* ITEMS */}
            {needs.slice(0, 3).map((need, i) => (
              <motion.div
                key={i}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/60"
                whileHover={{ scale: 1.03 }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{need.emoji}</span>
                  <span className="text-sm">{need.item}</span>
                </div>
                <span className="text-sm font-medium">{need.quantity}</span>
              </motion.div>
            ))}
          </div>

          {/* CTA Button */}
          <motion.div whileHover={{ scale: 1.04 }}>
            <Button className="w-full bg-primary text-primary-foreground shadow-md">
              <Heart className="mr-2 h-4 w-4" />
              View & Donate
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default NGOCard;
