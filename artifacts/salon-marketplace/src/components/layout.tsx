import { Link, useLocation } from "wouter";
import { Scissors, CalendarCheck, Menu, X, MapPin, User, LogOut, ChevronDown, Home, Compass, Layers, Tag, Info, Phone } from "lucide-react";
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

  const isActive = (path: string) =>
    path === "/" ? location === "/" : location.startsWith(path);

  const getInitials = (name: string) =>
    name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/salons", label: "Explore Salons", icon: Compass },
    { href: "/categories", label: "Services", icon: Layers },
    { href: "/salons?offers=true", label: "Offers", icon: Tag },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-primary/20 selection:text-primary-foreground">
      <header className="sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Scissors className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              Glam<span className="text-primary">Spot</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`px-3 py-2 rounded-lg transition-colors hover:text-primary hover:bg-primary/5
                  ${isActive(href) ? "text-primary bg-primary/5" : "text-muted-foreground"}`}
              >
                {label}
              </Link>
            ))}
            <Link
              href="/bookings"
              className={`px-3 py-2 rounded-lg transition-colors hover:text-primary hover:bg-primary/5 flex items-center gap-1.5
                ${isActive("/bookings") ? "text-primary bg-primary/5" : "text-muted-foreground"}`}
            >
              <CalendarCheck className="w-4 h-4" /> My Bookings
            </Link>
          </nav>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserMenuOpen(o => !o)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full border bg-card hover:bg-primary/5 transition-colors min-h-[44px]"
                >
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
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
                      <Link href="/account" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors">
                        <User className="h-4 w-4" /> Account Details
                      </Link>
                      <Link href="/bookings" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors">
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
                <Button variant="ghost" size="sm" asChild className="min-h-[44px] px-4 font-medium">
                  <Link href="/login">Login</Link>
                </Button>
                <Button size="sm" asChild className="min-h-[44px] px-5 font-semibold rounded-full shadow-sm">
                  <Link href="/register">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile: avatar + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            {user && (
              <Link href="/account">
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                  {getInitials(user.name)}
                </div>
              </Link>
            )}
            <Button variant="ghost" size="icon" className="w-11 h-11" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white px-4 py-4 space-y-1 shadow-lg">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-foreground hover:bg-primary/5 hover:text-primary font-medium min-h-[44px]"
                onClick={() => setMobileMenuOpen(false)}>
                <Icon className="h-4 w-4" /> {label}
              </Link>
            ))}
            <Link href="/bookings"
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-foreground hover:bg-primary/5 hover:text-primary font-medium min-h-[44px]"
              onClick={() => setMobileMenuOpen(false)}>
              <CalendarCheck className="h-4 w-4" /> My Bookings
            </Link>

            <div className="border-t pt-3 mt-3">
              {user ? (
                <>
                  <Link href="/account"
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-foreground hover:bg-accent font-medium min-h-[44px]"
                    onClick={() => setMobileMenuOpen(false)}>
                    <User className="h-4 w-4" /> Account Details
                  </Link>
                  <button
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-destructive hover:bg-destructive/10 font-medium min-h-[44px]"
                    onClick={async () => { setMobileMenuOpen(false); await logout(); }}
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 h-11 rounded-xl" asChild>
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                  </Button>
                  <Button className="flex-1 h-11 rounded-xl font-semibold" asChild>
                    <Link href="/register" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 w-full">
        {children}
      </main>

      <footer className="border-t bg-foreground text-background mt-auto">
        <div className="container mx-auto px-4 py-14">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Scissors className="h-4 w-4 text-white" />
                </div>
                <span className="text-xl font-bold">Glam<span className="text-primary">Spot</span></span>
              </div>
              <p className="text-background/60 text-sm max-w-sm mb-5 leading-relaxed">
                Hyderabad's trusted beauty salon marketplace. Discover, compare, and book appointments at the best salons near you.
              </p>
              <div className="flex items-center gap-2 text-sm text-background/50">
                <MapPin className="h-4 w-4" />
                <span>Hyderabad, Telangana, India</span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-background mb-5">Top Areas</h3>
              <ul className="space-y-3 text-sm text-background/60">
                <li><Link href="/salons?area=Banjara Hills" className="hover:text-primary transition-colors">Banjara Hills</Link></li>
                <li><Link href="/salons?area=Jubilee Hills" className="hover:text-primary transition-colors">Jubilee Hills</Link></li>
                <li><Link href="/salons?area=Madhapur" className="hover:text-primary transition-colors">Madhapur</Link></li>
                <li><Link href="/salons?area=Gachibowli" className="hover:text-primary transition-colors">Gachibowli</Link></li>
                <li><Link href="/salons?area=Hitech City" className="hover:text-primary transition-colors">Hitech City</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-background mb-5">Services</h3>
              <ul className="space-y-3 text-sm text-background/60">
                <li><Link href="/salons?category=Haircut" className="hover:text-primary transition-colors">Hair Styling</Link></li>
                <li><Link href="/salons?category=Bridal" className="hover:text-primary transition-colors">Bridal Makeup</Link></li>
                <li><Link href="/salons?category=Spa" className="hover:text-primary transition-colors">Spa & Massage</Link></li>
                <li><Link href="/salons?category=Nail Art" className="hover:text-primary transition-colors">Nail Art</Link></li>
                <li><Link href="/salons?category=Facial" className="hover:text-primary transition-colors">Facial & Skincare</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-background/10 mt-12 pt-8 text-center text-sm text-background/40 flex flex-col md:flex-row justify-between items-center gap-4">
            <p>© {new Date().getFullYear()} GlamSpot Hyderabad. All rights reserved.</p>
            <div className="flex gap-6">
              <span className="hover:text-background/70 cursor-pointer transition-colors">Terms</span>
              <span className="hover:text-background/70 cursor-pointer transition-colors">Privacy</span>
              <span className="hover:text-background/70 cursor-pointer transition-colors">Contact</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
