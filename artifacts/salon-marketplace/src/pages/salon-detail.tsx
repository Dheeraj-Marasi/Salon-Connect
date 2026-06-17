import { Layout } from "@/components/layout";
import { useGetSalon } from "@workspace/api-client-react";
import { useRoute, Link } from "wouter";
import { MapPin, Star, Clock, Phone, ArrowLeft, Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function SalonDetailPage() {
  const [, params] = useRoute("/salons/:id");
  const id = params?.id ? parseInt(params.id) : 0;
  
  const { data: salon, isLoading } = useGetSalon(id, { query: { enabled: !!id } });

  if (isLoading) {
    return (
      <Layout>
        <div className="animate-pulse">
          <div className="h-[40vh] bg-muted w-full"></div>
          <div className="container mx-auto px-4 -mt-16">
            <div className="bg-card rounded-3xl p-8 border shadow-sm w-full max-w-4xl">
              <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-muted rounded w-1/4"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!salon) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold mb-4">Salon not found</h2>
          <Link href="/salons">
            <Button>Return to Browse</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const imgUrl = salon.imageUrl || `/images/salon-${(salon.id % 5) + 1}.png`;

  return (
    <Layout>
      {/* Hero Image */}
      <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden bg-black">
        <img 
          src={imgUrl} 
          alt={salon.name} 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute top-4 left-4 z-10">
          <Link href="/salons">
            <Button variant="outline" size="sm" className="bg-background/80 backdrop-blur-md border-0 rounded-full text-foreground hover:bg-background">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 -mt-20 relative z-10 pb-20">
        <div className="bg-card rounded-3xl p-6 md:p-10 border shadow-md flex flex-col lg:flex-row gap-10">
          
          {/* Info Side */}
          <div className="flex-1">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{salon.name}</h1>
                  {salon.openNow ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">Open</Badge>
                  ) : (
                    <Badge variant="secondary">Closed</Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-muted-foreground text-sm">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {salon.area}
                  </span>
                  <span className="flex items-center gap-1 text-primary font-medium">
                    <Star className="w-4 h-4 fill-primary" />
                    {salon.rating.toFixed(1)} ({salon.reviewCount} reviews)
                  </span>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium">Address</h3>
                    <p className="text-sm text-muted-foreground">{salon.address}</p>
                  </div>
                </div>
                {salon.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h3 className="font-medium">Phone</h3>
                      <p className="text-sm text-muted-foreground">{salon.phone}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium">Hours</h3>
                    <p className="text-sm text-muted-foreground">{salon.openingTime} - {salon.closingTime}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">About</h3>
              <p className="text-muted-foreground leading-relaxed">
                {salon.description || "A premium beauty destination offering exceptional services in a relaxing environment. Our expert stylists and therapists are dedicated to making you look and feel your absolute best."}
              </p>
            </div>
            
            <div className="mt-8 flex flex-wrap gap-2">
              {salon.categories?.map(cat => (
                <Badge key={cat} variant="outline" className="rounded-full px-3 py-1 bg-muted/30">
                  {cat}
                </Badge>
              ))}
            </div>
          </div>

          {/* Services Side */}
          <div className="lg:w-[400px] shrink-0 bg-muted/20 rounded-2xl p-6 border border-border/50">
            <h3 className="text-xl font-semibold mb-6 flex items-center justify-between">
              Services
              <span className="text-sm font-normal text-muted-foreground">Select to book</span>
            </h3>

            <div className="space-y-3 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {salon.services?.length ? (
                salon.services.map(service => (
                  <Link key={service.id} href={`/book/${salon.id}?serviceId=${service.id}`}>
                    <div className="group bg-background rounded-xl p-4 border hover:border-primary/50 hover:shadow-sm cursor-pointer transition-all flex justify-between items-center">
                      <div>
                        <h4 className="font-medium group-hover:text-primary transition-colors">{service.name}</h4>
                        <p className="text-sm text-muted-foreground">{service.duration} mins</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">₹{service.price}</span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">No services listed yet.</p>
              )}
            </div>

            <Link href={`/book/${salon.id}`}>
              <Button size="lg" className="w-full rounded-xl text-lg h-14 shadow-lg shadow-primary/20">
                Book Appointment
              </Button>
            </Link>
          </div>
        </div>

        {/* Reviews Section */}
        {salon.reviews && salon.reviews.length > 0 && (
          <div className="mt-16">
            <h3 className="text-2xl font-bold mb-8">Client Reviews</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {salon.reviews.map(review => (
                <div key={review.id} className="bg-card rounded-2xl p-6 border">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                        {review.customerName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{review.customerName}</p>
                        <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md">
                      <Star className="w-3 h-3 fill-primary text-primary" />
                      <span className="text-xs font-medium">{review.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-foreground/80">{review.comment}</p>
                  {review.serviceName && (
                    <div className="mt-4 text-xs font-medium text-primary bg-primary/5 inline-block px-2 py-1 rounded">
                      Service: {review.serviceName}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
