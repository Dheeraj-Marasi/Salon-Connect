import { Layout } from "@/components/layout";
import { useListCategories } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Scissors, Droplet, Star, Sparkles, Heart } from "lucide-react";

export default function CategoriesPage() {
  const { data: categories, isLoading } = useListCategories();

  const getIcon = (name: string) => {
    if (name.includes("Hair")) return <Scissors className="w-8 h-8" />;
    if (name.includes("Spa") || name.includes("Massage")) return <Droplet className="w-8 h-8" />;
    if (name.includes("Nail")) return <Star className="w-8 h-8" />;
    if (name.includes("Bridal") || name.includes("Makeup")) return <Sparkles className="w-8 h-8" />;
    return <Heart className="w-8 h-8" />;
  };

  return (
    <Layout>
      <div className="bg-primary/5 py-16 border-b">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4 tracking-tight">Beauty Services</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From quick touch-ups to full day spa experiences, find exactly what you need.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="bg-card rounded-2xl border p-8 animate-pulse">
                <div className="w-12 h-12 bg-muted rounded-full mb-4"></div>
                <div className="h-5 bg-muted rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories?.map((cat) => (
              <Link key={cat.id} href={`/salons?category=${cat.name}`}>
                <div className="group bg-card rounded-2xl border p-8 text-center hover:shadow-md hover:border-primary/30 transition-all cursor-pointer">
                  <div className="w-16 h-16 mx-auto bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    {getIcon(cat.name)}
                  </div>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">{cat.name}</h3>
                  <p className="text-sm text-muted-foreground">{cat.salonCount} salons</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
