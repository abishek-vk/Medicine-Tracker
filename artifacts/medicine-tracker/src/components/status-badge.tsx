import React from "react";
import { Badge } from "@/components/ui/badge";
import { MedicineStatus } from "@workspace/api-client-react/src/generated/api.schemas";

export function StatusBadge({ status, className = "" }: { status: MedicineStatus, className?: string }) {
  const styles = {
    safe: "bg-green-100 text-green-800 border-green-200 hover:bg-green-100",
    near_expiry: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100",
    expiring_soon: "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100",
    expired: "bg-red-100 text-red-800 border-red-200 hover:bg-red-100",
  };

  const labels = {
    safe: "Safe",
    near_expiry: "Near Expiry",
    expiring_soon: "Expiring Soon",
    expired: "Expired",
  };

  return (
    <Badge variant="outline" className={`font-semibold ${styles[status]} ${className}`}>
      {labels[status]}
    </Badge>
  );
}
