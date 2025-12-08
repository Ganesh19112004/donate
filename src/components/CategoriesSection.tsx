import { useRef, useEffect } from "react";
import CategoryCard from "./CategoryCard";
import { Shirt, Book, Stethoscope, Home, Banknote, Package } from "lucide-react";

const CategoriesSection = () => {
  const sliderRef = useRef<HTMLDivElement>(null);

  const isDragging = useRef(false);
  const startX = useRef(0);
  const rotateY = useRef(0);
  const autoRotate = useRef(true);

  // Auto rotation
  useEffect(() => {
    const interval = setInterval(() => {
      if (autoRotate.current && sliderRef.current) {
        rotateY.current += 0.08;
        sliderRef.current.style.transform = `
          translateX(-50%)
          perspective(1200px)
          rotateX(-14deg)
          rotateY(${rotateY.current}deg)
        `;
      }
    }, 20);

    return () => clearInterval(interval);
  }, []);

  // Start drag
  const startDrag = (e: any) => {
    isDragging.current = true;
    autoRotate.current = false;

    startX.current = e.clientX || e.touches?.[0].clientX;
    sliderRef.current!.style.cursor = "grabbing";
  };

  // Drag rotate
  const onDrag = (e: any) => {
    if (!isDragging.current) return;

    const x = e.clientX || e.touches?.[0].clientX;
    const delta = x - startX.current;
    startX.current = x;

    rotateY.current += delta * 0.4;

    sliderRef.current!.style.transform = `
      translateX(-50%)
      perspective(1200px)
      rotateX(-14deg)
      rotateY(${rotateY.current}deg)
    `;
  };

  // End drag
  const endDrag = () => {
    isDragging.current = false;
    sliderRef.current!.style.cursor = "grab";

    setTimeout(() => {
      autoRotate.current = true;
    }, 1000);
  };

  const stopAuto = () => (autoRotate.current = false);
  const resumeAuto = () => setTimeout(() => (autoRotate.current = true), 1000);

  const categories = [
    { title: "Clothing", description: "Donate clothes", icon: Shirt, itemCount: 150, urgency: "medium" },
    { title: "Education Supplies", description: "School needs", icon: Book, itemCount: 280, urgency: "high" },
    { title: "Healthcare & Hygiene", description: "Sanitary kits", icon: Stethoscope, itemCount: 95, urgency: "high" },
    { title: "Shelter Support", description: "Blankets & tents", icon: Home, itemCount: 67, urgency: "medium" },
    { title: "Financial Contributions", description: "Monetary support", icon: Banknote, itemCount: 45, urgency: "low" },
    { title: "Other Essentials", description: "Tools and utensils", icon: Package, itemCount: 123, urgency: "low" },
  ];

  return (
    <div className="banner">
      <div
        className="slider"
        ref={sliderRef}
        style={{ ["--quantity" as any]: categories.length }}
        onMouseDown={startDrag}
        onMouseMove={onDrag}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        onTouchStart={startDrag}
        onTouchMove={onDrag}
        onTouchEnd={endDrag}
      >
        {categories.map((cat, idx) => (
          <div
            key={idx}
            className="item"
            style={{ ["--position" as any]: idx + 1 }}
            onMouseEnter={stopAuto}
            onMouseLeave={resumeAuto}
          >
            <CategoryCard {...cat} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesSection;
