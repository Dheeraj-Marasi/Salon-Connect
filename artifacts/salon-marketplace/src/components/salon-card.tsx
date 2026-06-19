import { MapPin, Star, Clock, ArrowRight, GitCompareArrows } from "lucide-react";
import { Link } from "wouter";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useCompare } from "@/contexts/compare-context";
import { type Salon } from "@workspace/api-client-react";

export function SalonCard({ salon }: { salon: Salon }) {
  const imgUrl = salon.imageUrl || `/images/salon-${(salon.id % 5) + 1}.png`;
  const { addToCompare, removeFromCompare, isInCompare, compareList } = useCompare();
  const inCompare = isInCompare(salon.id);
  const compareFull = compareList.length >= 2 && !inCompare;

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inCompare) {
      removeFromCompare(salon.id);
    } else if (!compareFull) {
      addToCompare(salon);
    }
  };

  return (
    <div className="group flex flex-col bg-card rounded-2xl border overflow-hidden hover:shadow-lg transition-all duration-300">
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
          className={`absolute top-3 left-3 z-10 flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-full shadow backdrop-blur-sm transition-all
            ${inCompare
              ? "bg-primary text-primary-foreground"
              : compareFull
              ? "bg-black/40 text-white/50 cursor-not-allowed"
              : "bg-white/90 text-foreground hover:bg-primary hover:text-primary-foreground"
            }`}
        >
          <GitCompareArrows className="w-3.5 h-3.5" />
          {inCompare ? "Added" : "Compare"}
        </button>

        <div className="absolute top-3 right-3 flex gap-2">
          {salon.openNow ? (
            <Badge className="bg-white/90 text-green-600 hover:bg-white border-none shadow-sm backdrop-blur-sm">Open Now</Badge>
          ) : (
            <Badge variant="secondary" className="bg-black/50 text-white hover:bg-black/60 border-none backdrop-blur-sm">Closed</Badge>
          )}
        </div>
        <div className="absolute bottom-3 left-3 flex gap-2 flex-wrap">
          {salon.categories?.slice(0, 2).map(cat => (
            <Badge key={cat} variant="secondary" className="bg-black/50 text-white hover:bg-black/60 border-none backdrop-blur-sm shadow-sm">
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {salon.name}
          </h3>
          <div className="flex items-center gap-1 text-sm font-medium shrink-0 bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            <Star className="w-3.5 h-3.5 fill-primary" />
            <span>{salon.rating.toFixed(1)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
          <MapPin className="w-4 h-4 shrink-0" />
          <span className="line-clamp-1">{salon.area}</span>
          <span className="mx-1.5 opacity-50">•</span>
          <span className="font-medium text-foreground">{salon.priceRange}</span>
        </div>

        <div className="mt-auto pt-4 border-t flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>{salon.openingTime} - {salon.closingTime}</span>
          </div>
          <Button asChild size="sm" className="rounded-full px-4 group-hover:shadow-md transition-all">
            <Link href={`/salons/${salon.id}`}>
              Book <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function SalonCardSkeleton() {
  return (
    <div className="flex flex-col bg-card rounded-2xl border overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-muted"></div>
      <div className="p-5">
        <div className="flex justify-between mb-3">
          <div className="h-5 bg-muted rounded w-2/3"></div>
          <div className="h-5 bg-muted rounded w-10"></div>
        </div>
        <div className="h-4 bg-muted rounded w-1/2 mb-6"></div>
        <div className="pt-4 border-t flex justify-between">
          <div className="h-4 bg-muted rounded w-1/3"></div>
          <div className="h-8 bg-muted rounded-full w-20"></div>
        </div>
      </div>
    </div>
  );
}
