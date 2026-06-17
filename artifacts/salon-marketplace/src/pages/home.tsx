import { Layout } from "@/components/layout";
import { SearchBar } from "@/components/search-bar";
import { SalonCard, SalonCardSkeleton } from "@/components/salon-card";
import { useGetFeaturedSalons, useGetSalonStats, useListCategories, useListAreas } from "@workspace/api-client-react";
import { Link } from "wouter";
import { ArrowRight, Star, Users, Home, TrendingUp, Scissors, Droplet, Sparkles, Heart, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

// Map category names to icons
const CategoryIcon = ({ name, className }: { name: string, className?: string }) => {
  if (name.includes("Hair")) return <Scissors className={className} />;
  if (name.includes("Spa") || name.includes("Massage")) return <Droplet className={className} />;
  if (name.includes("Nail")) return <Star className={className} />;
  if (name.includes("Bridal") || name.includes("Makeup")) return <Sparkles className={className} />;
  return <Heart className={className} />;
};

export default function HomePage() {
  const { data: featuredSalons, isLoading: isLoadingFeatured } = useGetFeaturedSalons();
  const { data: stats } = useGetSalonStats();
  const { data: categories } = useListCategories();
  const { data: areas } = useListAreas();

  // Pick top areas if available
  const topAreas = stats?.topAreas || areas?.slice(0, 8) || [];
  const displayCategories = categories?.slice(0, 6) || [];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Abstract background blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[100px]" />
          <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] rounded-full bg-accent/30 blur-[120px]" />
        </div>

        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            <span>Hyderabad's Premium Salon Network</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-foreground tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
            Discover Your Perfect <span className="text-primary italic font-serif">Glamour</span> Experience
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Book appointments at the most exclusive beauty salons and spas across Hyderabad. Fast, trusted, and beautiful.
          </p>

          <div className="mb-12">
            <SearchBar />
          </div>

          {/* Quick Categories */}
          <div className="flex flex-wrap justify-center gap-3">
            {displayCategories.map(cat => (
              <Link key={cat.id} href={`/salons?category=${cat.name}`}>
                <Button variant="outline" className="rounded-full bg-background hover:bg-primary/5 hover:text-primary border-border shadow-sm">
                  <CategoryIcon name={cat.name} className="w-4 h-4 mr-2" />
                  {cat.name}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Salons */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-3">Featured Salons</h2>
              <p className="text-muted-foreground">The most highly rated experiences in the city</p>
            </div>
            <Link href="/salons">
              <Button variant="ghost" className="hidden sm:flex group">
                View all <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoadingFeatured 
              ? Array(4).fill(0).map((_, i) => <SalonCardSkeleton key={i} />)
              : featuredSalons?.slice(0, 4).map(salon => (
                  <SalonCard key={salon.id} salon={salon} />
                ))
            }
          </div>
          
          <div className="mt-8 text-center sm:hidden">
            <Link href="/salons">
              <Button variant="outline" className="w-full">
                View all salons
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats & Trust */}
      {stats && (
        <section className="py-20 border-y bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-border/50">
              <div className="text-center px-4">
                <div className="text-4xl font-bold text-primary mb-2">{stats.totalSalons}+</div>
                <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Premium Salons</div>
              </div>
              <div className="text-center px-4">
                <div className="text-4xl font-bold text-primary mb-2">{stats.totalBookings}+</div>
                <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Appointments</div>
              </div>
              <div className="text-center px-4">
                <div className="text-4xl font-bold text-primary mb-2">{stats.avgRating.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Average Rating</div>
              </div>
              <div className="text-center px-4">
                <div className="text-4xl font-bold text-primary mb-2">{stats.totalServices}+</div>
                <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Services Listed</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Popular Areas */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-10 text-center">Popular Neighborhoods</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {topAreas.map((area, idx) => (
              <Link key={idx} href={`/salons?area=${area.name}`}>
                <div className="group p-6 rounded-2xl border bg-card hover:bg-primary/5 transition-colors cursor-pointer text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-accent/20 rounded-bl-full -z-10 transition-transform group-hover:scale-150"></div>
                  <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">{area.name}</h3>
                  <p className="text-sm text-muted-foreground">{area.salonCount} Salons</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-foreground text-background rounded-3xl mx-4 mb-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-16">How GlamSpot Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-background/10 flex items-center justify-center mb-6 text-primary">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">1. Discover</h3>
              <p className="text-background/70">Find the perfect salon by location, service, or rating. Browse verified reviews.</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-background/10 flex items-center justify-center mb-6 text-primary">
                <Home className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">2. Choose</h3>
              <p className="text-background/70">Select your preferred services, specialist, and a time slot that works for you.</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-6 text-primary">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">3. Experience</h3>
              <p className="text-background/70">Show up and enjoy a premium beauty experience. It's that simple.</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
