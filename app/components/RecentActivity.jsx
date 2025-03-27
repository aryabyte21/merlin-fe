"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from 'date-fns';

export default function RecentActivity() {
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    try {
      const storedActivities = localStorage.getItem('recentSubmissions');
      if (storedActivities) {
        setRecentActivities(JSON.parse(storedActivities));
      }
    } catch (error) {
      console.error('Error loading recent activities:', error);
    }
  }, []);

  if (recentActivities.length === 0) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
        <CardDescription>Your recent cargo updates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity, index) => (
            <div key={index} className="flex items-start justify-between border-b last:border-0 pb-3 last:pb-0">
              <div className="space-y-1">
                <p className="font-medium">{activity.mawb}</p>
                <div className="flex flex-col sm:flex-row sm:gap-2 text-xs text-muted-foreground">
                  <span>{formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}</span>
                  {activity.checker_id && (
                    <span className="hidden sm:inline">•</span>
                  )}
                  {activity.checker_id && (
                    <span>{activity.checker_id}{activity.team_name ? ` (${activity.team_name})` : ''}</span>
                  )}
                </div>
              </div>
              <Badge variant="outline" className="ml-auto">
                {activity.pcs_received} pcs
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}