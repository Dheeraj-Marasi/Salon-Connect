import { Layout } from "@/components/layout";
import { SearchBar } from "@/components/search-bar";
import { SalonCard, SalonCardSkeleton } from "@/components/salon-card";
import { useGetFeaturedSalons, useGetSalonStats, useListCategories, useListAreas } from "@workspace/api-client-react";
import { Link } from "wouter";
import { ArrowRight, Star, Users, TrendingUp, Scissors, Droplet, Sparkles, Heart, Search, CalendarCheck, Shield, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const CategoryIcon = ({ name, className }: { name: string; className?: string }) => {
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

  const topAreas = stats?.topAreas || areas?.slice(0, 8) || [];
  const displayCategories = categories?.slice(0, 6) || [];

  return (
    <Layout>

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative bg-white overflow-hidden border-b border-border">
        {/* Subtle gold accent line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#C9A227]" />

        <div className="container mx-auto px-4 pt-20 pb-24 md:pt-28 md:pb-32 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C9A227]/40 bg-[#C9A227]/8 text-[#9a7b1e] text-sm font-medium mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            Hyderabad's #1 Beauty Marketplace
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground tracking-tight mb-6 max-w-3xl mx-auto leading-[1.1]">
            Find and Book Trusted<br />
            <span className="text-[#C9A227]">Salons in Hyderabad</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
            Book appointments, compare prices, read reviews, and discover top salons near you.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-3 mb-12">
            <Button asChild size="lg" className="h-12 px-8 text-base font-semibold rounded-full shadow-md bg-foreground text-background hover:bg-foreground/90">
              <Link href="/salons">
                <CalendarCheck className="w-5 h-5 mr-2" /> Book Now
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base font-semibold rounded-full border-2 border-foreground/20 hover:border-foreground/40 hover:bg-secondary">
              <Link href="/salons">
                <Search className="w-5 h-5 mr-2" /> Explore Salons
              </Link>
            </Button>
          </div>

          {/* Search bar */}
          <div className="max-w-2xl mx-auto mb-10">
            <SearchBar />
          </div>

          {/* Quick category pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {displayCategories.map(cat => (
              <Link key={cat.id} href={`/salons?category=${cat.name}`}>
                <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border bg-white hover:bg-secondary hover:border-foreground/20 text-sm font-medium text-muted-foreground hover:text-foreground transition-all shadow-sm">
                  <CategoryIcon name={cat.name} className="w-3.5 h-3.5" />
                  {cat.name}
                </button>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ───────────────────────────────────────── */}
      {stats && (
        <section className="bg-foreground py-10">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-x divide-white/10">
              {[
                { value: `${stats.totalSalons}+`, label: "Premium Salons" },
                { value: `${stats.totalBookings}+`, label: "Appointments Booked" },
                { value: stats.avgRating.toFixed(1), label: "Average Rating" },
                { value: `${stats.totalServices}+`, label: "Services Available" },
              ].map(({ value, label }) => (
                <div key={label} className="text-center px-4">
                  <div className="text-3xl md:text-4xl font-bold text-[#C9A227] mb-1">{value}</div>
                  <div className="text-xs text-white/55 font-medium uppercase tracking-wider">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FEATURED SALONS ───────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <p className="text-[#C9A227] text-sm font-semibold uppercase tracking-wider mb-2">Top Picks</p>
              <h2 className="text-3xl font-bold text-foreground">Featured Salons</h2>
              <p className="text-muted-foreground mt-2">Highest rated experiences across Hyderabad</p>
            </div>
            <Link href="/salons">
              <Button variant="ghost" className="hidden sm:flex gap-1 group hover:bg-secondary">
                View all <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
              <Button variant="outline" className="w-full h-12 rounded-xl">View all salons</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── POPULAR AREAS ─────────────────────────────────────── */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-[#C9A227] text-sm font-semibold uppercase tracking-wider mb-2">Near You</p>
            <h2 className="text-3xl font-bold text-foreground">Popular Neighbourhoods</h2>
            <p className="text-muted-foreground mt-2">Find salons in your area</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {topAreas.map((area, idx) => (
              <Link key={idx} href={`/salons?area=${area.name}`}>
                <div className="group p-6 rounded-xl border bg-white hover:border-[#C9A227]/50 hover:shadow-md transition-all cursor-pointer text-center">
                  <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-foreground transition-colors">
                    <Search className="w-5 h-5 text-muted-foreground group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-semibold text-base mb-1 group-hover:text-[#C9A227] transition-colors">{area.name}</h3>
                  <p className="text-sm text-muted-foreground">{area.salonCount} Salons</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-[#C9A227] text-sm font-semibold uppercase tracking-wider mb-2">Simple Process</p>
            <h2 className="text-3xl font-bold text-foreground">How GlamSpot Works</h2>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">Book your beauty appointment in 3 easy steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-4xl mx-auto">
            {[
              { icon: Search, step: "01", title: "Discover", desc: "Search salons by location, service type, or rating. Browse real reviews from verified customers." },
              { icon: CalendarCheck, step: "02", title: "Book", desc: "Pick your service, choose a time slot that works for you, and confirm instantly." },
              { icon: Sparkles, step: "03", title: "Experience", desc: "Walk in and enjoy a premium beauty experience. No waiting, no hassle." },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="text-center group">
                <div className="relative inline-flex mb-6">
                  <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center group-hover:bg-foreground transition-colors">
                    <Icon className="w-7 h-7 text-foreground group-hover:text-white transition-colors" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-[#C9A227] text-white text-xs font-bold rounded-full flex items-center justify-center">{step}</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">{title}</h3>
                <p className="text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY GLAMSPOT ──────────────────────────────────────── */}
      <section className="py-20 bg-foreground">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Why Choose GlamSpot?</h2>
            <p className="text-white/50 max-w-md mx-auto">Everything you need for a great salon experience</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {[
              { icon: Shield, title: "Verified Salons", desc: "Every salon is reviewed and verified before listing." },
              { icon: Star, title: "Real Reviews", desc: "Honest ratings from real customers who visited." },
              { icon: TrendingUp, title: "Best Prices", desc: "Compare prices across salons to get the best deal." },
              { icon: Users, title: "Easy Booking", desc: "Book in seconds, cancel anytime, no hidden fees." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white/5 rounded-xl p-6 text-center border border-white/8 hover:border-[#C9A227]/40 transition-colors">
                <div className="w-12 h-12 bg-[#C9A227]/15 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-[#C9A227]" />
                </div>
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────────── */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl border border-border p-10 md:p-14 text-center shadow-sm">
            <div className="w-14 h-14 bg-[#C9A227]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-7 h-7 text-[#C9A227]" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Ready to Look Your Best?</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">Join thousands of Hyderabad residents who book with GlamSpot every day.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="h-12 px-8 bg-foreground text-white hover:bg-foreground/90 font-bold rounded-full shadow">
                <Link href="/register">Get Started Free <ChevronRight className="w-5 h-5 ml-1" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-8 rounded-full font-semibold border-border hover:bg-secondary">
                <Link href="/salons">Browse Salons</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

    </Layout>
  );
}
