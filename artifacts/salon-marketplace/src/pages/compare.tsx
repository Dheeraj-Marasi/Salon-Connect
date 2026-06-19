import { Layout } from "@/components/layout";
import { useGetSalon } from "@workspace/api-client-react";
import { Link } from "wouter";
import { MapPin, Star, Clock, Phone, Check, X, ArrowRight, ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

function getValue(val: string | number | null | undefined) {
  if (val === null || val === undefined || val === "") return "—";
  return val;
}

function StarRow({ a, b }: { a: number; b: number }) {
  const winner = a > b ? "a" : b > a ? "b" : null;
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
      <div className={`flex items-center gap-1.5 justify-end ${winner === "a" ? "font-bold text-primary" : ""}`}>
        <Star className={`w-4 h-4 ${winner === "a" ? "fill-primary text-primary" : "fill-amber-400 text-amber-400"}`} />
        <span>{a.toFixed(1)}</span>
        {winner === "a" && <Badge className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-none">Best</Badge>}
      </div>
      <span className="text-xs text-muted-foreground font-medium">Rating</span>
      <div className={`flex items-center gap-1.5 ${winner === "b" ? "font-bold text-primary" : ""}`}>
        {winner === "b" && <Badge className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-none">Best</Badge>}
        <Star className={`w-4 h-4 ${winner === "b" ? "fill-primary text-primary" : "fill-amber-400 text-amber-400"}`} />
        <span>{b.toFixed(1)}</span>
      </div>
    </div>
  );
}

function TextRow({ label, a, b, winA, winB }: { label: string; a: string; b: string; winA?: boolean; winB?: boolean }) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-4">
      <p className={`text-sm text-right ${winA ? "font-semibold text-primary" : "text-muted-foreground"}`}>{a}</p>
      <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">{label}</span>
      <p className={`text-sm ${winB ? "font-semibold text-primary" : "text-muted-foreground"}`}>{b}</p>
    </div>
  );
}

export default function ComparePage() {
  const params = new URLSearchParams(window.location.search);
  const idA = parseInt(params.get("a") || "0");
  const idB = parseInt(params.get("b") || "0");

  const { data: salonA, isLoading: loadA } = useGetSalon(idA, { query: { enabled: !!idA } });
  const { data: salonB, isLoading: loadB } = useGetSalon(idB, { query: { enabled: !!idB } });

  const isLoading = loadA || loadB;

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-8 mx-auto" />
          <div className="grid grid-cols-2 gap-6">
            <div className="h-48 bg-muted rounded-2xl" />
            <div className="h-48 bg-muted rounded-2xl" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!salonA || !salonB) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold mb-3">Salons not found</h2>
          <p className="text-muted-foreground mb-6">Please select two salons to compare from the browse page.</p>
          <Link href="/salons">
            <Button><ArrowLeft className="w-4 h-4 mr-2" />Browse Salons</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const imgA = salonA.imageUrl || `/images/salon-${(salonA.id % 5) + 1}.png`;
  const imgB = salonB.imageUrl || `/images/salon-${(salonB.id % 5) + 1}.png`;

  const priceRank: Record<string, number> = { "₹": 1, "₹₹": 2, "₹₹₹": 3, "₹₹₹₹": 4 };
  const priceA = priceRank[salonA.priceRange] ?? 0;
  const priceB = priceRank[salonB.priceRange] ?? 0;

  const servicesA = salonA.services ?? [];
  const servicesB = salonB.services ?? [];
  const maxServices = Math.max(servicesA.length, servicesB.length);

  const reviewsA = (salonA.reviews ?? []).length;
  const reviewsB = (salonB.reviews ?? []).length;

  return (
    <Layout>
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-6 flex items-center gap-3">
          <Link href="/salons">
            <Button variant="ghost" size="sm" className="rounded-full">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Salon Comparison</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">

        {/* Hero images side by side */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {[{ salon: salonA, img: imgA }, { salon: salonB, img: imgB }].map(({ salon, img }) => (
            <div key={salon.id} className="rounded-2xl overflow-hidden border bg-card shadow-sm">
              <div className="relative aspect-[16/9] overflow-hidden">
                <img src={img} alt={salon.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-white font-bold text-base md:text-lg leading-tight line-clamp-2">{salon.name}</p>
                </div>
                <div className="absolute top-2 right-2">
                  {salon.openNow ? (
                    <Badge className="bg-green-500/90 text-white border-none text-xs">Open</Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-black/60 text-white border-none text-xs">Closed</Badge>
                  )}
                </div>
              </div>
              <div className="p-3 flex justify-between items-center">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[120px]">{salon.area}</span>
                </div>
                <Link href={`/salons/${salon.id}`}>
                  <Button size="sm" variant="outline" className="h-7 text-xs px-3 rounded-full">
                    View <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison table */}
        <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">

          {/* Rating */}
          <div className="px-6 py-4">
            <StarRow a={salonA.rating} b={salonB.rating} />
          </div>
          <Separator />

          {/* Price range */}
          <div className="px-6 py-4">
            <TextRow
              label="Price Range"
              a={salonA.priceRange}
              b={salonB.priceRange}
              winA={priceA < priceB}
              winB={priceB < priceA}
            />
          </div>
          <Separator />

          {/* Hours */}
          <div className="px-6 py-4">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
              <div className="flex items-center gap-1.5 justify-end text-sm text-muted-foreground">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>{salonA.openingTime} – {salonA.closingTime}</span>
              </div>
              <span className="text-xs text-muted-foreground font-medium">Hours</span>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>{salonB.openingTime} – {salonB.closingTime}</span>
              </div>
            </div>
          </div>
          <Separator />

          {/* Phone */}
          <div className="px-6 py-4">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
              <div className="flex items-center gap-1.5 justify-end text-sm text-muted-foreground">
                <Phone className="w-3.5 h-3.5 shrink-0" />
                <span>{getValue(salonA.phone)}</span>
              </div>
              <span className="text-xs text-muted-foreground font-medium">Phone</span>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Phone className="w-3.5 h-3.5 shrink-0" />
                <span>{getValue(salonB.phone)}</span>
              </div>
            </div>
          </div>
          <Separator />

          {/* Reviews count */}
          <div className="px-6 py-4">
            <TextRow
              label="Reviews"
              a={`${reviewsA} review${reviewsA !== 1 ? "s" : ""}`}
              b={`${reviewsB} review${reviewsB !== 1 ? "s" : ""}`}
              winA={reviewsA > reviewsB}
              winB={reviewsB > reviewsA}
            />
          </div>
          <Separator />

          {/* Categories */}
          <div className="px-6 py-4">
            <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-4">
              <div className="flex flex-wrap justify-end gap-1">
                {(salonA.categories ?? []).map(c => (
                  <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                ))}
              </div>
              <span className="text-xs text-muted-foreground font-medium pt-1">Services</span>
              <div className="flex flex-wrap gap-1">
                {(salonB.categories ?? []).map(c => (
                  <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                ))}
              </div>
            </div>
          </div>
          <Separator />

          {/* Services pricing */}
          <div className="px-6 py-4">
            <p className="text-xs font-semibold text-muted-foreground text-center mb-4 uppercase tracking-wider">Service Pricing</p>
            <div className="space-y-3">
              {Array.from({ length: maxServices }).map((_, i) => {
                const sA = servicesA[i];
                const sB = servicesB[i];
                const cheaperA = sA && sB && parseFloat(String(sA.price)) < parseFloat(String(sB.price));
                const cheaperB = sA && sB && parseFloat(String(sB.price)) < parseFloat(String(sA.price));
                return (
                  <div key={i} className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                    {sA ? (
                      <div className={`text-right ${cheaperA ? "font-semibold text-primary" : ""}`}>
                        <p className="text-sm">{sA.name}</p>
                        <p className="text-xs text-muted-foreground">₹{sA.price} · {sA.duration}min</p>
                      </div>
                    ) : <div />}
                    <div className="flex items-center justify-center">
                      {sA && sB ? (
                        cheaperA ? (
                          <Check className="w-3.5 h-3.5 text-primary" />
                        ) : cheaperB ? (
                          <Check className="w-3.5 h-3.5 text-primary rotate-180 opacity-0" />
                        ) : (
                          <span className="text-xs text-muted-foreground">≈</span>
                        )
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </div>
                    {sB ? (
                      <div className={cheaperB ? "font-semibold text-primary" : ""}>
                        <p className="text-sm">{sB.name}</p>
                        <p className="text-xs text-muted-foreground">₹{sB.price} · {sB.duration}min</p>
                      </div>
                    ) : <div />}
                  </div>
                );
              })}
              {maxServices === 0 && (
                <p className="text-sm text-muted-foreground text-center">No services listed</p>
              )}
            </div>
          </div>
          <Separator />

          {/* CTA row */}
          <div className="px-6 py-5 bg-muted/30">
            <div className="grid grid-cols-2 gap-4">
              <Link href={`/salons/${salonA.id}`}>
                <Button className="w-full rounded-xl">
                  Book {salonA.name.split(" ")[0]} <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <Link href={`/salons/${salonB.id}`}>
                <Button className="w-full rounded-xl">
                  Book {salonB.name.split(" ")[0]} <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Verdict */}
        <div className="mt-6 p-5 bg-primary/5 border border-primary/10 rounded-2xl">
          <p className="text-sm font-semibold text-foreground mb-1">Quick Verdict</p>
          <p className="text-sm text-muted-foreground">
            {salonA.rating > salonB.rating
              ? <><span className="font-medium text-foreground">{salonA.name}</span> scores higher on rating ({salonA.rating.toFixed(1)} vs {salonB.rating.toFixed(1)}){priceA < priceB ? " and is more affordable" : ""}.</>
              : salonB.rating > salonA.rating
              ? <><span className="font-medium text-foreground">{salonB.name}</span> scores higher on rating ({salonB.rating.toFixed(1)} vs {salonA.rating.toFixed(1)}){priceB < priceA ? " and is more affordable" : ""}.</>
              : <>Both salons are equally rated at {salonA.rating.toFixed(1)} stars{priceA < priceB ? ` — ${salonA.name} is the better value` : priceB < priceA ? ` — ${salonB.name} is the better value` : " with similar pricing"}.</>
            }
            {" "}Use the details above to pick the best fit for your needs.
          </p>
        </div>
      </div>
    </Layout>
  );
}
