"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function DashboardStats() {
  const [stats, setStats] = useState({
    updatedToday: 0,
    totalUpdated: 0,
    loading: true
  });

  useEffect(() => {
    try {
      const storedActivities = localStorage.getItem('recentSubmissions');
      if (storedActivities) {
        const activities = JSON.parse(storedActivities);
        
        // Count today's updates
        const today = new Date().toDateString();
        const updatedToday = activities.filter(
          activity => new Date(activity.timestamp).toDateString() === today
        ).length;
        
        setStats({
          updatedToday,
          totalUpdated: activities.length,
          loading: false
        });
      } else {
        setStats(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  }, []);

  if (stats.loading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="h-24 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="text-sm font-medium text-muted-foreground">Today</div>
          <div className="text-2xl font-bold">{stats.updatedToday}</div>
          <div className="text-xs text-muted-foreground mt-1">Updated entries</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="text-sm font-medium text-muted-foreground">Total</div>
          <div className="text-2xl font-bold">{stats.totalUpdated}</div>
          <div className="text-xs text-muted-foreground mt-1">Updated entries</div>
        </CardContent>
      </Card>
    </div>
  );
}