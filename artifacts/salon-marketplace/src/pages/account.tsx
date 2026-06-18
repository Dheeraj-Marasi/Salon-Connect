import { useState } from "react";
import { useLocation, Link } from "wouter";
import { User, Mail, Phone, MapPin, Edit3, Save, X, LogOut, CalendarCheck, Loader2, CheckCircle } from "lucide-react";
import { useAuth, type UpdateProfileData } from "@/contexts/auth-context";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useListBookings } from "@workspace/api-client-react";

const HYDERABAD_AREAS = [
  "Banjara Hills", "Jubilee Hills", "Madhapur", "Hitech City",
  "Gachibowli", "Kukatpally", "Secunderabad", "Ameerpet",
  "Begumpet", "Kondapur", "Miyapur", "LB Nagar", "Dilsukhnagar",
];

export default function AccountPage() {
  const [, setLocation] = useLocation();
  const { user, logout, updateProfile, isLoading } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<UpdateProfileData & { name: string }>({
    name: user?.name ?? "",
    phone: user?.phone ?? "",
    address: user?.address ?? "",
    area: user?.area ?? "",
    latitude: user?.latitude ?? undefined,
    longitude: user?.longitude ?? undefined,
  });

  const { data: bookings } = useListBookings();
  const recentBookings = bookings?.slice(0, 3) ?? [];

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4">
          <div className="text-center">
            <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Sign in to your account</h2>
            <p className="text-muted-foreground mb-6">Manage your bookings, profile, and preferences</p>
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/register">Create Account</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const handleChange = (field: string, value: string | number | undefined) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm(f => ({
          ...f,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }));
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 10000 }
    );
  };

  const startEdit = () => {
    setForm({
      name: user.name,
      phone: user.phone ?? "",
      address: user.address ?? "",
      area: user.area ?? "",
      latitude: user.latitude ?? undefined,
      longitude: user.longitude ?? undefined,
    });
    setEditing(true);
    setSaveSuccess(false);
    setError("");
  };

  const handleSave = async () => {
    setError("");
    setSaving(true);
    try {
      await updateProfile({
        name: form.name || undefined,
        phone: form.phone || undefined,
        address: form.address || undefined,
        area: form.area || undefined,
        latitude: form.latitude,
        longitude: form.longitude,
      });
      setEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const getInitials = (name: string) =>
    name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const statusColor = (status: string) => {
    if (status === "confirmed") return "bg-green-100 text-green-700";
    if (status === "cancelled") return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold shrink-0">
              {getInitials(user.name)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
              <p className="text-muted-foreground text-sm">{user.email}</p>
              {user.area && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3" /> {user.area}, Hyderabad
                </span>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-muted-foreground gap-2 shrink-0" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>

        {saveSuccess && (
          <div className="mb-6 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
            <CheckCircle className="h-4 w-4 shrink-0" />
            Profile updated successfully!
          </div>
        )}

        {/* Profile Details Card */}
        <div className="bg-card border rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-foreground">Account Details</h2>
            {!editing ? (
              <Button variant="outline" size="sm" className="gap-2" onClick={startEdit}>
                <Edit3 className="h-4 w-4" /> Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                  <X className="h-4 w-4" />
                </Button>
                <Button size="sm" className="gap-2" onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save
                </Button>
              </div>
            )}
          </div>

          {!editing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InfoRow icon={<User className="h-4 w-4" />} label="Full Name" value={user.name} />
              <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={user.email} />
              <InfoRow icon={<Phone className="h-4 w-4" />} label="Phone" value={user.phone ?? "Not provided"} faded={!user.phone} />
              <InfoRow icon={<MapPin className="h-4 w-4" />} label="Area" value={user.area ?? "Not provided"} faded={!user.area} />
              <div className="sm:col-span-2">
                <InfoRow icon={<MapPin className="h-4 w-4" />} label="Address" value={user.address ?? "Not provided"} faded={!user.address} />
              </div>
              {(user.latitude && user.longitude) && (
                <div className="sm:col-span-2">
                  <InfoRow icon={<MapPin className="h-4 w-4" />} label="GPS Location" value={`${user.latitude.toFixed(5)}, ${user.longitude.toFixed(5)}`} />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={form.name}
                    onChange={e => handleChange("name", e.target.value)}
                    className="h-10"
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    type="tel"
                    value={form.phone}
                    onChange={e => handleChange("phone", e.target.value)}
                    className="h-10"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Street Address</Label>
                <Input
                  value={form.address}
                  onChange={e => handleChange("address", e.target.value)}
                  className="h-10"
                  placeholder="Your street address"
                />
              </div>
              <div className="space-y-2">
                <Label>Area / Neighbourhood</Label>
                <select
                  value={form.area}
                  onChange={e => handleChange("area", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select your area...</option>
                  {HYDERABAD_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full h-10 gap-2"
                onClick={handleGetLocation}
                disabled={locating}
              >
                {locating
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Detecting location...</>
                  : form.latitude
                    ? <><MapPin className="h-4 w-4 text-green-600" /><span className="text-green-600">GPS: {form.latitude?.toFixed(4)}, {form.longitude?.toFixed(4)}</span></>
                    : <><MapPin className="h-4 w-4" /> Use My Current Location</>
                }
              </Button>
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg px-4 py-3 text-sm">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="bg-card border rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-foreground">Recent Bookings</h2>
            <Link href="/bookings">
              <Button variant="ghost" size="sm" className="gap-1 text-primary">
                <CalendarCheck className="h-4 w-4" /> View all
              </Button>
            </Link>
          </div>
          {recentBookings.length === 0 ? (
            <div className="text-center py-8">
              <CalendarCheck className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No bookings yet</p>
              <Button asChild size="sm" className="mt-4" variant="outline">
                <Link href="/salons">Find a Salon</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentBookings.map(b => (
                <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{b.salonName}</p>
                    <p className="text-xs text-muted-foreground truncate">{b.serviceName} · {b.appointmentDate} at {b.appointmentTime}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize shrink-0 ${statusColor(b.status)}`}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function InfoRow({
  icon, label, value, faded = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  faded?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-primary mt-0.5 shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <p className={`text-sm font-medium ${faded ? "text-muted-foreground italic" : "text-foreground"}`}>{value}</p>
      </div>
    </div>
  );
}
