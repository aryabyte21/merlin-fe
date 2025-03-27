"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }) {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-slate-800 text-white px-4 py-3 shadow-md sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Merlin Cargo</h1>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:bg-slate-700"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-4">
            <span className="text-sm">
              {user.checkerId} | {user.teamName}
            </span>
            <Button variant="outline" size="sm" onClick={logout} className="text-black border-white hover:bg-slate-300">
              Logout
            </Button>
          </div>
        </div>
      </header>
      
      {/* Mobile menu overlay */}
      <div className={cn(
        "fixed inset-0 bg-slate-900/50 z-20 transition-opacity duration-200",
        isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <div className={cn(
          "bg-white w-64 h-full shadow-lg transform transition-transform duration-200",
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="p-4 border-b">
            <div className="font-semibold">{user.checkerId}</div>
            <div className="text-sm text-slate-500">{user.teamName}</div>
          </div>
          <div className="p-4">
            <Button variant="destructive" className="w-full" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
      
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
      
      <footer className="bg-slate-100 text-slate-600 px-4 py-3">
        <div className="container mx-auto text-center text-sm">
          &copy; {new Date().getFullYear()} Merlin Cargo Tracking
        </div>
      </footer>
    </div>
  );
}