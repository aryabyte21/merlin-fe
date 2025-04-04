"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { trolleyLogin } from "../../services/trolleyApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { Loader2, Truck } from "lucide-react";

const formSchema = z.object({
  employee_id: z.string().min(3, "Employee ID must be at least 3 characters"),
});

export default function TrolleyLoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employee_id: "",
    },
  });
  
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await trolleyLogin(data);
      if (response.success) {
        // Store user info in localStorage
        localStorage.setItem('trolleyUser', JSON.stringify(response.user));
        
        toast.success("Login successful", {
          description: `Welcome, Employee ${data.employee_id}!`,
          style: {
            backgroundColor: "#ecfdf5", // Light green background
            border: "1px solid #a7f3d0", // Green border
            color: "#047857" // Dark green text
          }
        });
        
        router.push("/trolley/dashboard");
      }
    } catch (error) {
      toast.error("Login failed", {
        description: error.message || "Please check your employee ID and try again.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-[350px] shadow-lg">
        <CardHeader className="space-y-2 pb-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center">
              <Truck className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Merlin Towing</CardTitle>
          <CardDescription className="text-center">
            Login to update baggage trolley numbers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="employee_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your employee ID" {...field} className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
              <div className="text-center mt-4">
            <Button variant="link" asChild>
              <a href="/login">Pickup Staff Login</a>
            </Button>
          </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col pt-0">
          <p className="text-xs text-center text-muted-foreground mt-4">
            Trolley/cart management interface
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}