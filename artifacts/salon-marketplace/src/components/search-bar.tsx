import { useState } from "react";
import { useLocation } from "wouter";
import { Search, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function SearchBar({ initialArea = "", initialSearch = "" }: { initialArea?: string, initialSearch?: string }) {
  const [, setLocation] = useLocation();
  const [area, setArea] = useState(initialArea);
  const [search, setSearch] = useState(initialSearch);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (area) params.append("area", area);
    if (search) params.append("search", search);
    
    setLocation(`/salons?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row bg-background p-2 sm:p-3 rounded-2xl sm:rounded-full shadow-lg border border-border/50 gap-3 w-full max-w-3xl mx-auto">
      <div className="flex items-center flex-1 px-3 sm:px-4 bg-muted/30 rounded-xl sm:rounded-full focus-within:ring-2 focus-within:ring-primary/20 transition-all">
        <Search className="w-5 h-5 text-muted-foreground shrink-0" />
        <Input 
          type="text" 
          placeholder="Service, salon, or category..." 
          className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-3 h-12 shadow-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      
      <div className="hidden sm:block w-[1px] bg-border my-2"></div>
      
      <div className="flex items-center flex-1 px-3 sm:px-4 bg-muted/30 rounded-xl sm:rounded-full focus-within:ring-2 focus-within:ring-primary/20 transition-all">
        <MapPin className="w-5 h-5 text-muted-foreground shrink-0" />
        <Input 
          type="text" 
          placeholder="Where in Hyderabad?" 
          className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-3 h-12 shadow-none"
          value={area}
          onChange={(e) => setArea(e.target.value)}
        />
      </div>
      
      <Button type="submit" size="lg" className="rounded-xl sm:rounded-full h-12 px-8 font-medium">
        Search
      </Button>
    </form>
  );
}
