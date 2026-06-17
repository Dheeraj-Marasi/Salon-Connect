import { Link, useLocation } from "wouter";
import { Search, Scissors, CalendarCheck, Menu, X, MapPin } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-primary/20 selection:text-primary-foreground">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary">
            <Scissors className="h-6 w-6" />
            <span className="text-xl font-bold tracking-tight text-foreground">
              GlamSpot
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/salons" className={`hover:text-primary transition-colors ${location.startsWith('/salons') ? 'text-primary' : ''}`}>
              Browse Salons
            </Link>
            <Link href="/categories" className={`hover:text-primary transition-colors ${location === '/categories' ? 'text-primary' : ''}`}>
              Categories
            </Link>
            <Link href="/bookings" className={`hover:text-primary transition-colors flex items-center gap-2 ${location === '/bookings' ? 'text-primary' : ''}`}>
              <CalendarCheck className="w-4 h-4" />
              My Bookings
            </Link>
          </nav>

          <div className="flex md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background px-4 py-4 space-y-4">
            <Link href="/salons" className="block text-foreground hover:text-primary font-medium" onClick={() => setMobileMenuOpen(false)}>
              Browse Salons
            </Link>
            <Link href="/categories" className="block text-foreground hover:text-primary font-medium" onClick={() => setMobileMenuOpen(false)}>
              Categories
            </Link>
            <Link href="/bookings" className="block text-foreground hover:text-primary font-medium" onClick={() => setMobileMenuOpen(false)}>
              My Bookings
            </Link>
          </div>
        )}
      </header>

      <main className="flex-1 w-full">
        {children}
      </main>

      <footer className="border-t bg-muted/40 mt-auto">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2 text-primary mb-4">
                <Scissors className="h-6 w-6" />
                <span className="text-xl font-bold tracking-tight text-foreground">
                  GlamSpot
                </span>
              </Link>
              <p className="text-muted-foreground text-sm max-w-sm mb-6">
                Hyderabad's premium beauty salon marketplace. Discover and book appointments at the best salons in your neighborhood.
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Hyderabad, Telangana</span>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Top Areas</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="/salons?area=Banjara Hills" className="hover:text-primary">Banjara Hills</Link></li>
                <li><Link href="/salons?area=Jubilee Hills" className="hover:text-primary">Jubilee Hills</Link></li>
                <li><Link href="/salons?area=Madhapur" className="hover:text-primary">Madhapur</Link></li>
                <li><Link href="/salons?area=Gachibowli" className="hover:text-primary">Gachibowli</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">Categories</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="/salons?category=Haircut" className="hover:text-primary">Hair Styling</Link></li>
                <li><Link href="/salons?category=Bridal" className="hover:text-primary">Bridal Makeup</Link></li>
                <li><Link href="/salons?category=Spa" className="hover:text-primary">Spa & Massage</Link></li>
                <li><Link href="/salons?category=Nail Art" className="hover:text-primary">Nail Art</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground flex flex-col md:flex-row justify-between items-center gap-4">
            <p>© {new Date().getFullYear()} GlamSpot Hyderabad. All rights reserved.</p>
            <div className="flex gap-6">
              <span className="hover:text-foreground cursor-pointer">Terms</span>
              <span className="hover:text-foreground cursor-pointer">Privacy</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
