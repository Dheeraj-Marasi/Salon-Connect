import { Layout } from "@/components/layout";
import { useListBookings, useUpdateBookingStatus } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Calendar, Clock, MapPin, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function BookingsPage() {
  const { data: bookings, isLoading } = useListBookings();
  const updateStatus = useUpdateBookingStatus();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-700 hover:bg-green-100 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-700 hover:bg-red-100 border-red-200';
      default: return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200';
    }
  };

  const handleCancel = (id: number) => {
    updateStatus.mutate({ id, data: { status: 'cancelled' } });
  };

  return (
    <Layout>
      <div className="bg-muted/30 border-b py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
          <p className="text-muted-foreground mt-2">Manage your upcoming and past appointments</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-32 bg-card rounded-2xl border animate-pulse"></div>
            ))}
          </div>
        ) : bookings && bookings.length > 0 ? (
          <div className="space-y-6 max-w-4xl mx-auto">
            {bookings.map(booking => (
              <div key={booking.id} className="bg-card border rounded-2xl p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center hover:shadow-md transition-shadow">
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-start md:items-center">
                    <h3 className="text-xl font-semibold">{booking.serviceName}</h3>
                    <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span className="font-medium text-foreground">{booking.salonName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-primary">₹{booking.totalPrice}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(booking.appointmentDate), "PPP")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{booking.appointmentTime}</span>
                    </div>
                  </div>
                </div>

                {booking.status.toLowerCase() !== 'cancelled' && (
                  <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0">
                    <Button 
                      variant="outline" 
                      className="flex-1 md:w-full text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/30"
                      onClick={() => handleCancel(booking.id)}
                      disabled={updateStatus.isPending}
                    >
                      Cancel Booking
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 max-w-md mx-auto">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-semibold mb-3">No bookings yet</h3>
            <p className="text-muted-foreground mb-8">
              You haven't booked any appointments yet. Discover top salons and treat yourself to a beauty session.
            </p>
            <Button asChild size="lg" className="rounded-xl">
              <a href="/salons">Explore Salons</a>
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
