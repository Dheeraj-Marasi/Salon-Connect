import { Layout } from "@/components/layout";
import { SalonCard, SalonCardSkeleton } from "@/components/salon-card";
import { useListSalons, useListCategories, useListAreas } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function SalonsPage() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [area, setArea] = useState(searchParams.get("area") || "all");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [minRating, setMinRating] = useState(searchParams.get("minRating") || "all");

  const { data: salons, isLoading } = useListSalons({
    search: search || undefined,
    area: area !== "all" ? area : undefined,
    category: category !== "all" ? category : undefined,
    minRating: minRating !== "all" ? Number(minRating) : undefined
  });

  const { data: areas } = useListAreas();
  const { data: categories } = useListCategories();

  // Sync state with URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (area !== "all") params.set("area", area);
    if (category !== "all") params.set("category", category);
    if (minRating !== "all") params.set("minRating", minRating);
    
    const newUrl = `/salons${params.toString() ? `?${params.toString()}` : ''}`;
    window.history.replaceState(null, '', newUrl);
  }, [search, area, category, minRating]);

  const clearFilters = () => {
    setSearch("");
    setArea("all");
    setCategory("all");
    setMinRating("all");
  };

  const hasFilters = search || area !== "all" || category !== "all" || minRating !== "all";

  return (
    <Layout>
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Discover Salons</h1>
          
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="Search salons, services..." 
                className="pl-10 h-12 bg-background shadow-sm rounded-xl"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap sm:flex-nowrap gap-4">
              <Select value={area} onValueChange={setArea}>
                <SelectTrigger className="w-[160px] h-12 bg-background rounded-xl">
                  <SelectValue placeholder="Area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Areas</SelectItem>
                  {areas?.map(a => (
                    <SelectItem key={a.name} value={a.name}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[160px] h-12 bg-background rounded-xl">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map(c => (
                    <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={minRating} onValueChange={setMinRating}>
                <SelectTrigger className="w-[140px] h-12 bg-background rounded-xl">
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Rating</SelectItem>
                  <SelectItem value="4.5">4.5+ Stars</SelectItem>
                  <SelectItem value="4.0">4.0+ Stars</SelectItem>
                  <SelectItem value="3.0">3.0+ Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {hasFilters && (
            <div className="flex items-center gap-2 mt-4">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 px-2 text-xs">
                Clear all <X className="w-3 h-3 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="mb-6 flex justify-between items-center">
          <p className="text-muted-foreground">
            Showing <span className="font-medium text-foreground">{isLoading ? "..." : salons?.length || 0}</span> salons
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => <SalonCardSkeleton key={i} />)}
          </div>
        ) : salons && salons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {salons.map(salon => (
              <SalonCard key={salon.id} salon={salon} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No salons found</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              We couldn't find any salons matching your current filters. Try adjusting your search criteria.
            </p>
            <Button onClick={clearFilters}>Clear Filters</Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
