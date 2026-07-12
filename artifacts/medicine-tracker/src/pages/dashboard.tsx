import React from "react";
import { useGetDashboardSummary, useGetRecentMedicines } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck, AlertTriangle, AlertCircle, XCircle } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary();
  const { data: recent, isLoading: loadingRecent } = useGetRecentMedicines({ limit: 5 });
  const recentMedicines = normalizeRecentMedicines(recent);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Overview of your medicine inventory and expiry status.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Safe" value={summary?.safe} icon={ShieldCheck} color="text-green-600" loading={loadingSummary} />
        <StatCard title="Near Expiry" value={summary?.nearExpiry} icon={AlertTriangle} color="text-yellow-600" loading={loadingSummary} />
        <StatCard title="Expiring Soon" value={summary?.expiringSoon} icon={AlertCircle} color="text-orange-600" loading={loadingSummary} />
        <StatCard title="Expired" value={summary?.expired} icon={XCircle} color="text-red-600" loading={loadingSummary} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Recent Additions</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingRecent ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : recentMedicines.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No recent medicines.</div>
            ) : (
              <div className="divide-y">
                {recentMedicines.map((med) => (
                  <Link key={med.id} href={`/medicines/${med.id}`}>
                    <div className="flex items-center justify-between py-3 hover:bg-muted/50 px-2 rounded-md transition-colors cursor-pointer group">
                      <div>
                        <div className="font-medium group-hover:text-primary transition-colors">{med.name}</div>
                        <div className="text-sm text-muted-foreground font-mono">{med.batchNumber}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-right">
                          <div>Qty: {med.quantity}</div>
                          <div className="text-muted-foreground text-xs">{new Date(med.expiryDate).toLocaleDateString()}</div>
                        </div>
                        <StatusBadge status={med.status} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Summary</CardTitle>
          </CardHeader>
          <CardContent>
             {loadingSummary ? (
               <Skeleton className="h-48 w-full" />
             ) : (
               <div className="space-y-4">
                 <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                   <span className="font-medium">Total Medicines</span>
                   <span className="font-bold text-xl">{summary?.total || 0}</span>
                 </div>
                 <div className="space-y-2">
                   <div className="flex justify-between text-sm">
                     <span>Safe</span>
                     <span>{summary?.safe || 0}</span>
                   </div>
                   <div className="w-full bg-secondary rounded-full h-2">
                     <div className="bg-green-500 h-2 rounded-full" style={{ width: `${((summary?.safe || 0) / (summary?.total || 1)) * 100}%` }} />
                   </div>
                 </div>
                 <div className="space-y-2">
                   <div className="flex justify-between text-sm">
                     <span>At Risk (Near/Soon/Expired)</span>
                     <span>{(summary?.nearExpiry || 0) + (summary?.expiringSoon || 0) + (summary?.expired || 0)}</span>
                   </div>
                   <div className="w-full bg-secondary rounded-full h-2">
                     <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(((summary?.nearExpiry || 0) + (summary?.expiringSoon || 0) + (summary?.expired || 0)) / (summary?.total || 1)) * 100}%` }} />
                   </div>
                 </div>
               </div>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, loading }: { title: string, value?: number, icon: any, color: string, loading: boolean }) {
  return (
    <Card>
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {loading ? (
            <Skeleton className="h-8 w-16 mt-2" />
          ) : (
            <h3 className="text-3xl font-bold mt-1">{value || 0}</h3>
          )}
        </div>
        <div className={`p-3 rounded-full bg-secondary ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
      </CardContent>
    </Card>
  );
}

function normalizeRecentMedicines(recent: unknown) {
  if (Array.isArray(recent)) {
    return recent;
  }

  if (recent && typeof recent === "object") {
    const candidate = (recent as { data?: unknown }).data;
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
}
