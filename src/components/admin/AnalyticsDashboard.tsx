import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Eye, MessageCircle, Star, BookOpen, TrendingUp, Globe } from "lucide-react";

interface AnalyticsData {
  totalUsers: number;
  uniqueVisitors: number;
  totalPageViews: number;
  totalFeedback: number;
  totalReviews: number;
  totalChats: number;
  publishedMantras: number;
  todayViews: number;
  topPages: { page_path: string; count: number }[];
  recentUsers: { name: string; created_at: string }[];
  viewsByDay: { date: string; count: number }[];
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];

      const [
        usersRes,
        pageViewsRes,
        todayViewsRes,
        feedbackRes,
        reviewsRes,
        chatsRes,
        mantrasRes,
        topPagesRes,
        recentUsersRes,
        dailyViewsRes,
      ] = await Promise.all([
        supabase.from("app_users").select("id", { count: "exact", head: true }),
        supabase.from("page_views").select("device_id"),
        supabase.from("page_views").select("id", { count: "exact", head: true }).gte("created_at", `${today}T00:00:00`),
        supabase.from("feedback").select("id", { count: "exact", head: true }),
        supabase.from("reviews").select("id", { count: "exact", head: true }),
        supabase.from("chat_conversations").select("id", { count: "exact", head: true }),
        supabase.from("mantras").select("id", { count: "exact", head: true }).eq("is_published", true),
        supabase.from("page_views").select("page_path").limit(1000),
        supabase.from("app_users").select("name, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("page_views").select("created_at").order("created_at", { ascending: false }).limit(1000),
      ]);

      // Count unique visitors
      const uniqueDevices = new Set((pageViewsRes.data || []).map((r) => r.device_id));

      // Count top pages
      const pageCounts: Record<string, number> = {};
      (topPagesRes.data || []).forEach((r) => {
        pageCounts[r.page_path] = (pageCounts[r.page_path] || 0) + 1;
      });
      const topPages = Object.entries(pageCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([page_path, count]) => ({ page_path, count }));

      // Views by day (last 7 days)
      const dayCounts: Record<string, number> = {};
      (dailyViewsRes.data || []).forEach((r) => {
        const day = r.created_at.split("T")[0];
        dayCounts[day] = (dayCounts[day] || 0) + 1;
      });
      const viewsByDay = Object.entries(dayCounts)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .slice(-7)
        .map(([date, count]) => ({ date, count }));

      setData({
        totalUsers: usersRes.count || 0,
        uniqueVisitors: uniqueDevices.size,
        totalPageViews: (pageViewsRes.data || []).length,
        todayViews: todayViewsRes.count || 0,
        totalFeedback: feedbackRes.count || 0,
        totalReviews: reviewsRes.count || 0,
        totalChats: chatsRes.count || 0,
        publishedMantras: mantrasRes.count || 0,
        topPages,
        recentUsers: recentUsersRes.data || [],
        viewsByDay,
      });
    } catch (e) {
      console.error("Analytics fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading analytics...</span>
      </Card>
    );
  }

  if (!data) return null;

  const stats = [
    { label: "Unique Visitors", value: data.uniqueVisitors, icon: Globe, color: "text-blue-500" },
    { label: "Registered Users", value: data.totalUsers, icon: Users, color: "text-emerald-500" },
    { label: "Total Page Views", value: data.totalPageViews, icon: Eye, color: "text-violet-500" },
    { label: "Today's Views", value: data.todayViews, icon: TrendingUp, color: "text-orange-500" },
    { label: "Published Mantras", value: data.publishedMantras, icon: BookOpen, color: "text-primary" },
    { label: "Chat Sessions", value: data.totalChats, icon: MessageCircle, color: "text-cyan-500" },
    { label: "Reviews", value: data.totalReviews, icon: Star, color: "text-yellow-500" },
    { label: "Feedback", value: data.totalFeedback, icon: MessageCircle, color: "text-pink-500" },
  ];

  return (
    <Card className="p-4 mb-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">📊 Analytics</h2>
        <button onClick={fetchAnalytics} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          Refresh
        </button>
      </div>

      {/* Stat Grid */}
      <div className="grid grid-cols-2 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center gap-2.5 rounded-xl border bg-background p-3">
            <s.icon className={`h-4 w-4 shrink-0 ${s.color}`} />
            <div className="min-w-0">
              <p className="text-lg font-bold leading-tight">{s.value.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground truncate">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Views by Day */}
      {data.viewsByDay.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">Daily Views (Last 7 Days)</p>
          <div className="flex items-end gap-1 h-16">
            {data.viewsByDay.map((d) => {
              const max = Math.max(...data.viewsByDay.map((v) => v.count), 1);
              const height = Math.max((d.count / max) * 100, 4);
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-0.5">
                  <span className="text-[9px] text-muted-foreground">{d.count}</span>
                  <div
                    className="w-full rounded-t bg-primary/80 transition-all"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-[8px] text-muted-foreground">
                    {new Date(d.date + "T00:00:00").toLocaleDateString("en", { month: "short", day: "numeric" })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Pages */}
      {data.topPages.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-1.5">Top Pages</p>
          <div className="space-y-1">
            {data.topPages.map((p) => (
              <div key={p.page_path} className="flex items-center justify-between text-xs">
                <span className="truncate text-foreground font-mono">{p.page_path}</span>
                <Badge variant="secondary" className="text-[10px] shrink-0 ml-2">{p.count}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Users */}
      {data.recentUsers.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-1.5">Recent Users</p>
          <div className="space-y-1">
            {data.recentUsers.map((u, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-foreground">{u.name}</span>
                <span className="text-muted-foreground text-[10px]">
                  {new Date(u.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
