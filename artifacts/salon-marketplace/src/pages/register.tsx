import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Scissors, Eye, EyeOff, UserPlus, MapPin, Loader2 } from "lucide-react";
import { useAuth, type RegisterData } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const HYDERABAD_AREAS = [
  "Banjara Hills", "Jubilee Hills", "Madhapur", "Hitech City",
  "Gachibowli", "Kukatpally", "Secunderabad", "Ameerpet",
  "Begumpet", "Kondapur", "Miyapur", "LB Nagar", "Dilsukhnagar",
];

function getEmailFromUrl() {
  try {
    return new URLSearchParams(window.location.search).get("email") ?? "";
  } catch {
    return "";
  }
}

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const { register } = useAuth();
  const [form, setForm] = useState<RegisterData & { confirmPassword: string }>({
    name: "", email: getEmailFromUrl(), password: "", confirmPassword: "",
    phone: "", address: "", area: "",
    latitude: undefined, longitude: undefined,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locSuccess, setLocSuccess] = useState(false);

  const handleChange = (field: string, value: string | number) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    setLocSuccess(false);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm(f => ({
          ...f,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }));
        setLocating(false);
        setLocSuccess(true);
      },
      () => {
        setLocating(false);
        setError("Could not get your location. Please enter it manually.");
      },
      { timeout: 10000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword, ...data } = form;
      void confirmPassword;
      await register({
        ...data,
        phone: data.phone || undefined,
        address: data.address || undefined,
        area: data.area || undefined,
      });
      setLocation("/account");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-primary mb-6">
            <Scissors className="h-7 w-7" />
            <span className="text-2xl font-bold text-foreground">GlamSpot</span>
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">Create your account</h1>
          <p className="text-muted-foreground">Join Hyderabad's beauty community</p>
        </div>

        <div className="bg-card border rounded-2xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Personal Details */}
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider text-muted-foreground">Personal Details</h2>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g. Priya Sharma"
                value={form.name}
                onChange={e => handleChange("name", e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => handleChange("email", e.target.value)}
                  required
                  autoComplete="email"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={e => handleChange("phone", e.target.value)}
                  className="h-11"
                />
              </div>
            </div>

            {/* Password */}
            <div className="border-t pt-5 space-y-1">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Set Password</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 6 characters"
                    value={form.password}
                    onChange={e => handleChange("password", e.target.value)}
                    required
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password <span className="text-destructive">*</span></Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repeat password"
                  value={form.confirmPassword}
                  onChange={e => handleChange("confirmPassword", e.target.value)}
                  required
                  className="h-11"
                />
              </div>
            </div>

            {/* Location Details */}
            <div className="border-t pt-5 space-y-1">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Your Location</h2>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                type="text"
                placeholder="e.g. Flat 4B, Green Valley Apartments"
                value={form.address}
                onChange={e => handleChange("address", e.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="area">Area / Neighbourhood</Label>
              <select
                id="area"
                value={form.area}
                onChange={e => handleChange("area", e.target.value)}
                className="flex h-11 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select your area...</option>
                {HYDERABAD_AREAS.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            {/* Current Location Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 gap-2"
              onClick={handleGetLocation}
              disabled={locating}
            >
              {locating ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Detecting your location...</>
              ) : locSuccess ? (
                <><MapPin className="h-4 w-4 text-green-600" /> <span className="text-green-600">Location detected!</span> Lat: {form.latitude?.toFixed(4)}, Lng: {form.longitude?.toFixed(4)}</>
              ) : (
                <><MapPin className="h-4 w-4" /> Use My Current Location</>
              )}
            </Button>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Create Account
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
