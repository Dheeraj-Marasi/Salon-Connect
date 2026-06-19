import { MapPin, Star, Clock, ArrowRight, Eye, GitCompareArrows } from "lucide-react";
import { Link } from "wouter";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useCompare } from "@/contexts/compare-context";
import { type Salon } from "@workspace/api-client-react";

const PRICE_LABEL: Record<string, string> = {
  "₹": "From ₹199",
  "₹₹": "From ₹499",
  "₹₹₹": "From ₹999",
  "₹₹₹₹": "From ₹1,999",
};

export function SalonCard({ salon }: { salon: Salon }) {
  const imgUrl = salon.imageUrl || `/images/salon-${(salon.id % 5) + 1}.png`;
  const { addToCompare, removeFromCompare, isInCompare, compareList } = useCompare();
  const inCompare = isInCompare(salon.id);
  const compareFull = compareList.length >= 2 && !inCompare;
  const startingPrice = PRICE_LABEL[salon.priceRange] ?? salon.priceRange;

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inCompare) removeFromCompare(salon.id);
    else if (!compareFull) addToCompare(salon);
  };

  return (
    <div className="group flex flex-col bg-white rounded-2xl border overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">

      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={imgUrl}
          alt={salon.name}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />

        {/* Compare toggle */}
        <button
          onClick={handleCompare}
          title={compareFull ? "Remove a salon to compare this one" : inCompare ? "Remove from comparison" : "Add to comparison"}
          className={`absolute top-3 left-3 z-10 flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full shadow backdrop-blur-sm transition-all
            ${inCompare
              ? "bg-primary text-white"
              : compareFull
              ? "bg-black/40 text-white/50 cursor-not-allowed"
              : "bg-white/90 text-foreground hover:bg-primary hover:text-white"
            }`}
        >
          <GitCompareArrows className="w-3.5 h-3.5" />
          {inCompare ? "Added" : "Compare"}
        </button>

        {/* Open/closed */}
        <div className="absolute top-3 right-3">
          {salon.openNow ? (
            <Badge className="bg-green-500 text-white border-none shadow-sm text-xs px-2.5">Open</Badge>
          ) : (
            <Badge variant="secondary" className="bg-black/60 text-white border-none text-xs px-2.5">Closed</Badge>
          )}
        </div>

        {/* Category pills */}
        <div className="absolute bottom-3 left-3 flex gap-1.5 flex-wrap">
          {salon.categories?.slice(0, 2).map(cat => (
            <Badge key={cat} variant="secondary" className="bg-black/55 text-white border-none text-xs backdrop-blur-sm">
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 gap-3">

        {/* Name + Rating */}
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-bold text-base text-foreground line-clamp-1 group-hover:text-primary transition-colors leading-snug">
            {salon.name}
          </h3>
          <div className="flex items-center gap-1 shrink-0 bg-[#FF9800]/10 text-[#e65100] px-2 py-0.5 rounded-full text-xs font-bold">
            <Star className="w-3.5 h-3.5 fill-[#FF9800] text-[#FF9800]" />
            {salon.rating.toFixed(1)}
          </div>
        </div>

        {/* Location + Price */}
        <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-primary/70" />
            <span className="truncate">{salon.area}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-base leading-none">💰</span>
            <span className="font-medium text-foreground">{startingPrice}</span>
            <span className="text-muted-foreground/60">·</span>
            <span className="text-xs">{salon.priceRange}</span>
          </div>
        </div>

        {/* Hours */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span>{salon.openingTime} – {salon.closingTime}</span>
        </div>

        {/* CTA buttons */}
        <div className="flex gap-2 mt-auto pt-1">
          <Button asChild variant="outline" size="sm" className="flex-1 h-11 rounded-xl text-sm font-medium border-border hover:border-primary/40 hover:text-primary">
            <Link href={`/salons/${salon.id}`}>
              <Eye className="w-3.5 h-3.5 mr-1.5" /> View Details
            </Link>
          </Button>
          <Button asChild size="sm" className="flex-1 h-11 rounded-xl text-sm font-semibold shadow-sm">
            <Link href={`/salons/${salon.id}`}>
              Book Now <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function SalonCardSkeleton() {
  return (
    <div className="flex flex-col bg-white rounded-2xl border overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-muted"></div>
      <div className="p-5 space-y-3">
        <div className="flex justify-between">
          <div className="h-5 bg-muted rounded w-2/3"></div>
          <div className="h-5 bg-muted rounded w-10"></div>
        </div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
        <div className="h-4 bg-muted rounded w-1/3"></div>
        <div className="h-8 bg-muted rounded-lg w-full"></div>
        <div className="flex gap-2 pt-1">
          <div className="h-11 bg-muted rounded-xl flex-1"></div>
          <div className="h-11 bg-muted rounded-xl flex-1"></div>
        </div>
      </div>
    </div>
  );
}
