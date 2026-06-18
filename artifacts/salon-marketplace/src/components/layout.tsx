import { Link, useLocation } from "wouter";
import { Search, Scissors, CalendarCheck, Menu, X, MapPin, User, LogOut, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { useAuth } from "@/contexts/auth-context";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitials = (name: string) =>
    name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

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
            <Link href="/bookings" className={`hover:text-primary transition-colors flex items-center gap-1.5 ${location === '/bookings' ? 'text-primary' : ''}`}>
              <CalendarCheck className="w-4 h-4" />
              My Bookings
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserMenuOpen(o => !o)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-card hover:bg-accent transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                    {getInitials(user.name)}
                  </div>
                  <span className="text-sm font-medium text-foreground max-w-[120px] truncate">{user.name.split(" ")[0]}</span>
                  <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-card border rounded-xl shadow-lg overflow-hidden z-50">
                    <div className="px-4 py-3 border-b bg-muted/40">
                      <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/account"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors"
                      >
                        <User className="h-4 w-4" /> Account Details
                      </Link>
                      <Link
                        href="/bookings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors"
                      >
                        <CalendarCheck className="h-4 w-4" /> My Bookings
                      </Link>
                      <div className="border-t my-1" />
                      <button
                        onClick={async () => { setUserMenuOpen(false); await logout(); }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Join Free</Link>
                </Button>
              </>
            )}
          </div>

          <div className="flex md:hidden items-center gap-2">
            {user && (
              <Link href="/account">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                  {getInitials(user.name)}
                </div>
              </Link>
            )}
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background px-4 py-4 space-y-1">
            <Link href="/salons" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-foreground hover:bg-accent font-medium" onClick={() => setMobileMenuOpen(false)}>
              <Search className="h-4 w-4" /> Browse Salons
            </Link>
            <Link href="/categories" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-foreground hover:bg-accent font-medium" onClick={() => setMobileMenuOpen(false)}>
              Categories
            </Link>
            <Link href="/bookings" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-foreground hover:bg-accent font-medium" onClick={() => setMobileMenuOpen(false)}>
              <CalendarCheck className="h-4 w-4" /> My Bookings
            </Link>
            {user ? (
              <>
                <Link href="/account" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-foreground hover:bg-accent font-medium" onClick={() => setMobileMenuOpen(false)}>
                  <User className="h-4 w-4" /> Account Details
                </Link>
                <button
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-destructive hover:bg-destructive/10 font-medium"
                  onClick={async () => { setMobileMenuOpen(false); await logout(); }}
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                </Button>
                <Button size="sm" className="flex-1" asChild>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>Join Free</Link>
                </Button>
              </div>
            )}
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
                <span className="text-xl font-bold tracking-tight text-foreground">GlamSpot</span>
              </Link>
              <p className="text-muted-foreground text-sm max-w-sm mb-6">
                Hyderabad's premium beauty salon marketplace. Discover and book appointments at the best salons in your neighbourhood.
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
