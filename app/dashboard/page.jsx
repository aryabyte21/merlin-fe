"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateReceivedPieces, fetchMawbSuggestions } from "../services/api";
import DashboardLayout from "../components/layout/DashboardLayout";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  mawb: z.string().min(5, "MAWB number is required"),
  pcs_received: z.coerce
    .number()
    .min(1, "Number of pieces must be at least 1")
    .max(10000, "Number exceeds maximum limit"),
});

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [recentSubmissions, setRecentSubmissions] = useState([]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mawb: "",
      pcs_received: "",
    },
  });

  // Load recent submissions from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("recentSubmissions");
      if (stored) {
        setRecentSubmissions(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load recent submissions", e);
    }
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length >= 2) {
        setLoadingSuggestions(true);
        try {
          const data = await fetchMawbSuggestions(searchQuery);
          setSuggestions(data);
        } catch (error) {
          console.error("Error fetching suggestions:", error);
        } finally {
          setLoadingSuggestions(false);
        }
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Add user info to the data
      const submitData = {
        ...data,
        checker_id: user?.checkerId || "",
        team_name: user?.teamName || ""
      };
      
      await updateReceivedPieces(submitData);
      
      // Update recent submissions
      const newSubmission = {
        mawb: data.mawb,
        pcs_received: data.pcs_received,
        checker_id: user?.checkerId,
        team_name: user?.teamName,
        timestamp: new Date().toISOString()
      };
      
      const updated = [newSubmission, ...recentSubmissions.slice(0, 4)]; // Keep only last 5
      setRecentSubmissions(updated);
      
      try {
        localStorage.setItem("recentSubmissions", JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save recent submissions", e);
      }
      
      toast.success("Success!", {
        description: `Updated ${data.pcs_received} pieces for MAWB ${data.mawb}`,
        duration: 4000,
      });
      
      // Reset form after successful submission
      form.reset();
      setShowManualInput(false);
      
    } catch (error) {
      toast.error("Error updating record", {
        description: error.response?.data?.error || "Please try again later",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualInputChange = (e) => {
    form.setValue("mawb", e.target.value);
    setSearchQuery(e.target.value);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-md mx-auto">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl">Update Cargo</CardTitle>
            <CardDescription>
              Enter the MAWB number and received pieces
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="mawb"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>MAWB Number</FormLabel>
                      <div className="flex flex-col gap-2">
                        {!showManualInput ? (
                          <>
                            <Popover open={open} onOpenChange={setOpen}>
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
                                    {field.value || "Select MAWB number"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0">
                                <Command>
                                  <CommandInput 
                                    placeholder="Search MAWB..." 
                                    onValueChange={setSearchQuery}
                                    value={searchQuery}
                                  />
                                  {loadingSuggestions && (
                                    <div className="flex items-center justify-center py-6">
                                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                    </div>
                                  )}
                                  {!loadingSuggestions && (
                                    <>
                                      <CommandEmpty>No MAWB number found.</CommandEmpty>
                                      <CommandGroup>
                                        {suggestions.map((mawb) => (
                                          <CommandItem
                                            key={mawb}
                                            value={mawb}
                                            onSelect={() => {
                                              form.setValue("mawb", mawb);
                                              setOpen(false);
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
                            
                            <Button 
                              type="button" 
                              variant="link" 
                              className="text-sm self-end"
                              onClick={() => setShowManualInput(true)}
                            >
                              Type manually instead
                            </Button>
                          </>
                        ) : (
                          <>
                            <Input
                              placeholder="Type MAWB number..."
                              value={field.value}
                              onChange={handleManualInputChange}
                              className="w-full"
                            />
                            
                            <Button 
                              type="button" 
                              variant="link" 
                              className="text-sm self-end"
                              onClick={() => setShowManualInput(false)}
                            >
                              Use dropdown instead
                            </Button>
                          </>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pcs_received"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Pieces Received</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter number of pieces"
                          {...field}
                          inputMode="numeric" // Better for mobile number input
                          className="w-full"
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
                    "Submit"
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
            <CardContent className="p-0"> {/* Remove default padding */}
              <div className="max-h-[280px] overflow-y-auto"> {/* Fixed height with scrolling */}
                <div className="px-6 py-2 space-y-2"> {/* Add padding to content */}
                  {recentSubmissions.map((submission, index) => (
                    <div 
                      key={index} 
                      className="flex justify-between items-center text-sm p-2 border-b last:border-0 hover:bg-slate-50"
                    >
                      <div>
                        <div className="font-medium">{submission.mawb}</div>
                        <div className="text-muted-foreground text-xs">
                          {new Date(submission.timestamp).toLocaleString()}
                        </div>
                        {submission.checker_id && (
                          <div className="text-muted-foreground text-xs">
                            {submission.checker_id} {submission.team_name ? `(${submission.team_name})` : ""}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center bg-slate-100 px-2 py-1 rounded-md">
                        <span className="font-medium">{submission.pcs_received}</span>
                        <span className="text-muted-foreground ml-1">pcs</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}