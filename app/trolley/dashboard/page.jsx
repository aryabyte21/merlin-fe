"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fetchFlightSuggestions, fetchMawbByFlight, updateBtNumber } from "../../services/trolleyApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { Loader2, ChevronsUpDown, Check, LogOut } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  flight_number: z.string().min(2, "Flight number is required"),
  mawb: z.string().min(4, "MAWB number is required"),
  bt_number: z.string().min(2, "BT number is required"),
});

export default function TrolleyDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  
  // Flight suggestions state
  const [flightSearchQuery, setFlightSearchQuery] = useState("");
  const [flightSuggestions, setFlightSuggestions] = useState([]);
  const [loadingFlightSuggestions, setLoadingFlightSuggestions] = useState(false);
  const [openFlightPopover, setOpenFlightPopover] = useState(false);
  
  // MAWB list for selected flight
  const [mawbList, setMawbList] = useState([]);
  const [loadingMawbList, setLoadingMawbList] = useState(false);
  const [openMawbPopover, setOpenMawbPopover] = useState(false);
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      flight_number: "",
      mawb: "",
      bt_number: "",
    },
  });
  
  // Check if user is logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('trolleyUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      router.push("/trolley/login");
    }
    
    // Load recent submissions
    try {
      const stored = localStorage.getItem("recentBtSubmissions");
      if (stored) {
        setRecentSubmissions(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load recent submissions", e);
    }
  }, [router]);
  
  // Fetch flight suggestions when query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (flightSearchQuery.length >= 2) {
        setLoadingFlightSuggestions(true);
        try {
          const data = await fetchFlightSuggestions(flightSearchQuery);
          setFlightSuggestions(data);
        } catch (error) {
          console.error("Error fetching flight suggestions:", error);
        } finally {
          setLoadingFlightSuggestions(false);
        }
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [flightSearchQuery]);
  
  // Fetch MAWB list when flight changes
  const handleFlightSelected = async (flight) => {
    form.setValue("flight_number", flight);
    form.setValue("mawb", ""); // Reset MAWB when flight changes
    setOpenFlightPopover(false);
    
    setLoadingMawbList(true);
    try {
      const mawbs = await fetchMawbByFlight(flight);
      setMawbList(mawbs);
    } catch (error) {
      console.error("Error fetching MAWBs for flight:", error);
      toast.error("Could not fetch MAWBs", {
        description: "Failed to load MAWB list for this flight"
      });
    } finally {
      setLoadingMawbList(false);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('trolleyUser');
    router.push("/trolley/login");
  };
  
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Add employee ID to the data
      const submitData = {
        ...data,
        employee_id: user?.employeeId || "",
      };
      
      await updateBtNumber({
        mawb: data.mawb,
        bt_number: data.bt_number,
        employee_id: user?.employeeId || ""
      });
      
      // Update recent submissions
      const newSubmission = {
        flight_number: data.flight_number,
        mawb: data.mawb,
        bt_number: data.bt_number,
        employee_id: user?.employeeId,
        timestamp: new Date().toISOString()
      };
      
      const updated = [newSubmission, ...recentSubmissions.slice(0, 4)]; // Keep only last 5
      setRecentSubmissions(updated);
      
      try {
        localStorage.setItem("recentBtSubmissions", JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save recent submissions", e);
      }
      
      toast.success("Success!", {
        description: `Updated BT number ${data.bt_number} for MAWB ${data.mawb}`,
        duration: 4000,
        style: {
          backgroundColor: "#ecfdf5", // Light green background
          border: "1px solid #a7f3d0", // Green border
          color: "#047857" // Dark green text
        }
      });
      
      // Reset BT number field but keep flight and MAWB for next entry
      form.setValue("bt_number", "");
      
    } catch (error) {
      toast.error("Error updating BT number", {
        description: error.message || "Please try again later",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (!user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-indigo-600 text-white px-4 py-3 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Merlin Trolley</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm">
              Employee {user.employeeId}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout} 
              className="text-black border-white hover:bg-indigo-700">
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-md mx-auto space-y-8">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl">Update BT Number</CardTitle>
              <CardDescription>
                Add a trolley/baggage number to a shipment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="flight_number"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Flight Number</FormLabel>
                        <Popover open={openFlightPopover} onOpenChange={setOpenFlightPopover}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value || "Select flight number"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput 
                                placeholder="Search flight..." 
                                onValueChange={setFlightSearchQuery}
                                value={flightSearchQuery}
                              />
                              {loadingFlightSuggestions && (
                                <div className="flex items-center justify-center py-6">
                                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                              )}
                              {!loadingFlightSuggestions && (
                                <>
                                  <CommandEmpty>No flight found.</CommandEmpty>
                                  <CommandGroup>
                                    {flightSuggestions.map((flight) => (
                                      <CommandItem
                                        key={flight}
                                        value={flight}
                                        onSelect={() => handleFlightSelected(flight)}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            field.value === flight ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                        {flight}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </>
                              )}
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="mawb"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>MAWB Number</FormLabel>
                        <Popover open={openMawbPopover} onOpenChange={setOpenMawbPopover}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                disabled={mawbList.length === 0}
                                className={cn(
                                  "w-full justify-between",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value || (mawbList.length === 0 ? "Select flight first" : "Select MAWB number")}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput placeholder="Search MAWB..." />
                              {loadingMawbList && (
                                <div className="flex items-center justify-center py-6">
                                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                              )}
                              {!loadingMawbList && (
                                <>
                                  <CommandEmpty>No MAWB number found.</CommandEmpty>
                                  <CommandGroup>
                                    {mawbList.map((mawb) => (
                                      <CommandItem
                                        key={mawb}
                                        value={mawb}
                                        onSelect={() => {
                                          form.setValue("mawb", mawb);
                                          setOpenMawbPopover(false);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            field.value === mawb ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                        {mawb}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </>
                              )}
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="bt_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>BT Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter baggage trolley number"
                            {...field}
                            className="h-10"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Delivered"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          {recentSubmissions.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Recent Updates</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[280px] overflow-y-auto">
                  <div className="px-6 py-2 space-y-2">
                    {recentSubmissions.map((submission, index) => (
                      <div 
                        key={index} 
                        className="flex justify-between items-center text-sm p-2 border-b last:border-0 hover:bg-slate-50"
                      >
                        <div>
                          <div className="flex gap-2">
                            <span className="font-medium">{submission.flight_number}</span>
                            <span className="text-slate-500">•</span>
                            <span>{submission.mawb}</span>
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {new Date(submission.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center bg-indigo-100 text-indigo-800 px-2 py-1 rounded-md">
                          <span className="font-medium">{submission.bt_number}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}