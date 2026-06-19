import { X, ArrowRightLeft, Plus } from "lucide-react";
import { Link } from "wouter";
import { useCompare } from "@/contexts/compare-context";
import { Button } from "./ui/button";

export function CompareBar() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();

  if (compareList.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-4 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-2xl bg-card border shadow-2xl rounded-2xl px-5 py-3.5 flex items-center gap-4">
        <div className="flex items-center gap-1.5 shrink-0">
          <ArrowRightLeft className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Compare</span>
        </div>

        <div className="flex-1 flex items-center gap-3 min-w-0">
          {compareList.map(salon => {
            const img = salon.imageUrl || `/images/salon-${(salon.id % 5) + 1}.png`;
            return (
              <div key={salon.id} className="flex items-center gap-2 bg-muted rounded-xl px-3 py-1.5 min-w-0">
                <img src={img} alt={salon.name} className="w-7 h-7 rounded-lg object-cover shrink-0" />
                <span className="text-sm font-medium text-foreground truncate max-w-[120px]">{salon.name}</span>
                <button
                  onClick={() => removeFromCompare(salon.id)}
                  className="text-muted-foreground hover:text-foreground shrink-0 ml-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}

          {compareList.length === 1 && (
            <div className="flex items-center gap-2 border border-dashed border-muted-foreground/30 rounded-xl px-3 py-1.5 text-muted-foreground">
              <Plus className="w-3.5 h-3.5" />
              <span className="text-sm">Add one more</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearCompare}
            className="h-8 px-3 text-xs text-muted-foreground"
          >
            Clear
          </Button>
          {compareList.length === 2 ? (
            <Link href={`/compare?a=${compareList[0].id}&b=${compareList[1].id}`}>
              <Button size="sm" className="h-8 px-4 text-xs rounded-full">
                Compare now
              </Button>
            </Link>
          ) : (
            <Button size="sm" className="h-8 px-4 text-xs rounded-full" disabled>
              Compare now
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
