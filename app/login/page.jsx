"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { login } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  checkerId: z.string().min(3, "Checker ID must be at least 3 characters"),
  teamName: z.string().min(2, "Team name must be at least 2 characters"),
});

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login: authLogin } = useAuth();
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      checkerId: "",
      teamName: "",
    },
  });
  
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await login(data);
      if (response.success) {
        authLogin(response.user);
        
        toast.success("Login successful", {
          description: `Welcome, ${data.checkerId} from ${data.teamName} team!`,
        });
        
        router.push("/dashboard");
      }
    } catch (error) {
      toast.error("Login failed", {
        description: error.message || "Please check your credentials and try again.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <Card className="w-[350px]">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-lg font-bold">M</span>
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Merlin</CardTitle>
          <CardDescription className="text-center">
            Log in to access the cargo tracking system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="checkerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Checker ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your checker ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="teamName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your team name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}