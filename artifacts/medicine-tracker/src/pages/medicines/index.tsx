import React, { useState } from "react";
import { useListMedicines } from "@workspace/api-client-react";
import { Link } from "wouter";
import { StatusBadge } from "@/components/status-badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search } from "lucide-react";
import { MedicineStatus, ListMedicinesSortBy } from "@workspace/api-client-react/src/generated/api.schemas";

export default function Medicines() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<MedicineStatus | "all">("all");
  const [sortBy, setSortBy] = useState<ListMedicinesSortBy>("name");

  const { data: medicines, isLoading } = useListMedicines({
    search: search || undefined,
    status: status === "all" ? undefined : status,
    sortBy,
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Medicines</h1>
          <p className="text-muted-foreground mt-2">Manage your entire medicine inventory.</p>
        </div>
        <Link href="/medicines/new">
          <Button className="gap-2" data-testid="button-add-medicine">
            <Plus className="h-4 w-4" /> Add Medicine
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, batch, or manufacturer..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={(v: any) => setStatus(v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="safe">Safe</SelectItem>
            <SelectItem value="near_expiry">Near Expiry</SelectItem>
            <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="expiryDate">Expiry Date</SelectItem>
            <SelectItem value="quantity">Quantity</SelectItem>
            <SelectItem value="createdAt">Date Added</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name & Batch</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">Loading...</TableCell>
              </TableRow>
            ) : medicines?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No medicines found.</TableCell>
              </TableRow>
            ) : (
              medicines?.map((med) => (
                <TableRow key={med.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <TableCell>
                    <Link href={`/medicines/${med.id}`} className="block">
                      <div className="font-medium text-primary">{med.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{med.batchNumber}</div>
                    </Link>
                  </TableCell>
                  <TableCell>{med.category}</TableCell>
                  <TableCell>{med.quantity}</TableCell>
                  <TableCell>
                    {new Date(med.expiryDate).toLocaleDateString()}
                    <div className="text-xs text-muted-foreground">{med.remainingDays} days left</div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={med.status} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
