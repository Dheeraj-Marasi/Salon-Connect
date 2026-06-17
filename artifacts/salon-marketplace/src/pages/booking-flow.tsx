import { Layout } from "@/components/layout";
import { useRoute, useLocation } from "wouter";
import { useGetSalon, useCreateBooking } from "@workspace/api-client-react";
import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, addDays } from "date-fns";
import { CalendarIcon, Clock, Scissors, User, Phone, CheckCircle2, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const bookingSchema = z.object({
  serviceId: z.string().min(1, "Please select a service"),
  appointmentDate: z.date({ required_error: "Please select a date" }),
  appointmentTime: z.string().min(1, "Please select a time"),
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerPhone: z.string().min(10, "Valid phone number required"),
});

const TIME_SLOTS = [
  "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", 
  "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM",
  "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
  "06:00 PM", "07:00 PM"
];

export default function BookingFlowPage() {
  const [, params] = useRoute("/book/:salonId");
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const initialServiceId = searchParams.get("serviceId");
  
  const salonId = params?.salonId ? parseInt(params.salonId) : 0;
  const { data: salon, isLoading } = useGetSalon(salonId, { query: { enabled: !!salonId } });
  const createBooking = useCreateBooking();
  
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<z.infer<typeof bookingSchema>>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      serviceId: initialServiceId || "",
      customerName: "",
      customerPhone: "",
    },
  });

  const selectedServiceId = form.watch("serviceId");
  const selectedService = useMemo(() => 
    salon?.services?.find(s => s.id.toString() === selectedServiceId),
  [salon, selectedServiceId]);

  const onSubmit = (values: z.infer<typeof bookingSchema>) => {
    createBooking.mutate({
      data: {
        salonId,
        serviceId: parseInt(values.serviceId),
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        appointmentDate: format(values.appointmentDate, "yyyy-MM-dd"),
        appointmentTime: values.appointmentTime,
      }
    }, {
      onSuccess: () => {
        setIsSuccess(true);
      }
    });
  };

  if (isLoading) return <Layout><div className="flex h-[60vh] items-center justify-center">Loading...</div></Layout>;
  if (!salon) return <Layout><div className="text-center py-20">Salon not found</div></Layout>;

  if (isSuccess) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 max-w-lg">
          <div className="bg-card border rounded-3xl p-10 text-center shadow-xl shadow-primary/5">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Booking Confirmed!</h1>
            <p className="text-muted-foreground mb-8">
              Your appointment at <span className="font-semibold text-foreground">{salon.name}</span> has been successfully scheduled.
            </p>
            
            <div className="bg-muted/30 rounded-2xl p-6 text-left mb-8 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service</span>
                <span className="font-medium">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{format(form.getValues("appointmentDate"), "PPP")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium">{form.getValues("appointmentTime")}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">₹{selectedService?.price}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button className="w-full rounded-xl h-12" onClick={() => setLocation("/bookings")}>
                View My Bookings
              </Button>
              <Button variant="outline" className="w-full rounded-xl h-12" onClick={() => setLocation("/")}>
                Return Home
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-muted/30 border-b py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <Button variant="ghost" className="mb-6 -ml-4" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Salon
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Book Appointment</h1>
          <p className="text-muted-foreground text-lg">{salon.name} • {salon.area}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
            
            {/* Step 1: Service */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">1</span>
                Select Service
              </h2>
              <div className="pl-10">
                <FormField
                  control={form.control}
                  name="serviceId"
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-14 rounded-xl bg-background text-base">
                            <SelectValue placeholder="Choose a service" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {salon.services?.map(service => (
                            <SelectItem key={service.id} value={service.id.toString()}>
                              <div className="flex justify-between w-full pr-4 items-center">
                                <span>{service.name}</span>
                                <span className="text-muted-foreground text-sm ml-4">₹{service.price} • {service.duration}m</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Step 2: Date & Time */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">2</span>
                Date & Time
              </h2>
              <div className="pl-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="appointmentDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal h-12 rounded-xl",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date() || date > addDays(new Date(), 30)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="appointmentTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-xl">
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[200px]">
                          {TIME_SLOTS.map(time => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Step 3: Details */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">3</span>
                Your Details
              </h2>
              <div className="pl-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input placeholder="John Doe" className="pl-10 h-12 rounded-xl" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customerPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input placeholder="+91 98765 43210" className="pl-10 h-12 rounded-xl" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Summary & Submit */}
            <div className="bg-card border rounded-3xl p-6 shadow-sm mt-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-muted-foreground mb-1">Total to pay at salon</p>
                <p className="text-3xl font-bold text-primary">
                  {selectedService ? `₹${selectedService.price}` : "—"}
                </p>
              </div>
              <Button 
                type="submit" 
                size="lg" 
                className="w-full md:w-auto h-14 px-10 rounded-xl text-lg shadow-lg shadow-primary/20"
                disabled={createBooking.isPending}
              >
                {createBooking.isPending ? "Confirming..." : "Confirm Booking"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Layout>
  );
}
