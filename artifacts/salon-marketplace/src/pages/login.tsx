import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Scissors, Eye, EyeOff, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { ApiError } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsNewUser(false);
    setLoading(true);
    try {
      await login(form.email, form.password);
      setLocation("/account");
    } catch (err: unknown) {
      if (err instanceof ApiError && err.code === "EMAIL_NOT_FOUND") {
        setIsNewUser(true);
      } else {
        setError(err instanceof Error ? err.message : "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-primary mb-6">
            <Scissors className="h-7 w-7" />
            <span className="text-2xl font-bold text-foreground">GlamSpot</span>
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back</h1>
          <p className="text-muted-foreground">Sign in to manage your beauty appointments</p>
        </div>

        {/* New-user suggestion banner */}
        {isNewUser && (
          <div className="mb-5 bg-primary/5 border border-primary/20 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0 bg-primary/10 rounded-full p-1.5">
                <UserPlus className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground text-sm mb-0.5">
                  Looks like you're new here!
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  No account found for{" "}
                  <span className="font-medium text-foreground">{form.email}</span>.
                  Create a free account to start booking at Hyderabad's top salons.
                </p>
                <div className="flex gap-2">
                  <Link href={`/register?email=${encodeURIComponent(form.email)}`}>
                    <Button size="sm" className="h-8 text-xs px-4">
                      <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                      Create a free account
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-xs px-3 text-muted-foreground"
                    onClick={() => setIsNewUser(false)}
                  >
                    Try again
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Card */}
        <div className="bg-card border rounded-2xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => {
                  setForm(f => ({ ...f, email: e.target.value }));
                  setIsNewUser(false);
                  setError("");
                }}
                required
                autoComplete="email"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => {
                    setForm(f => ({ ...f, password: e.target.value }));
                    setError("");
                  }}
                  required
                  autoComplete="current-password"
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

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign in
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary font-medium hover:underline">
              Create one free
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          By signing in you agree to our{" "}
          <span className="hover:underline cursor-pointer">Terms</span> and{" "}
          <span className="hover:underline cursor-pointer">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}
