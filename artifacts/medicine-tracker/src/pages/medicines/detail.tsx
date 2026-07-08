import React, { useState } from "react";
import { useGetMedicine, useDeleteMedicine } from "@workspace/api-client-react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function MedicineDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: medicine, isLoading } = useGetMedicine(id!);
  const deleteMutation = useDeleteMedicine();

  const handleDelete = () => {
    deleteMutation.mutate({ id: id! }, {
      onSuccess: () => {
        toast({ title: "Medicine deleted" });
        setLocation("/medicines");
      },
      onError: () => {
        toast({ title: "Failed to delete medicine", variant: "destructive" });
      }
    });
  };

  if (isLoading) {
    return <div className="p-8"><Skeleton className="h-64 w-full" /></div>;
  }

  if (!medicine) {
    return <div className="p-8 text-center">Medicine not found.</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => setLocation("/medicines")} className="gap-2 -ml-4">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">{medicine.name}</h1>
          <p className="text-xl text-muted-foreground mt-2 font-mono">Batch: {medicine.batchNumber}</p>
        </div>
        <div className="flex items-center gap-4">
          <StatusBadge status={medicine.status} className="text-lg px-4 py-1" />
          <Button variant="outline" className="gap-2" onClick={() => setLocation(`/medicines/${id}/edit`)}>
            <Edit className="h-4 w-4" /> Edit
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the medicine record.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-muted-foreground">Manufacturer</div>
              <div className="font-medium">{medicine.manufacturer}</div>
              
              <div className="text-muted-foreground">Category</div>
              <div className="font-medium">{medicine.category}</div>
              
              <div className="text-muted-foreground">Storage Location</div>
              <div className="font-medium">{medicine.storageLocation}</div>
              
              <div className="text-muted-foreground">Quantity</div>
              <div className="font-medium text-lg">{medicine.quantity}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-muted-foreground">Manufacturing Date</div>
              <div className="font-medium">{new Date(medicine.manufacturingDate).toLocaleDateString()}</div>
              
              <div className="text-muted-foreground">Expiry Date</div>
              <div className="font-medium">{new Date(medicine.expiryDate).toLocaleDateString()}</div>
              
              <div className="text-muted-foreground">Remaining Days</div>
              <div className="font-medium text-lg">{medicine.remainingDays}</div>
              
              <div className="text-muted-foreground">QR Code Value</div>
              <div className="font-mono bg-secondary p-1 rounded inline-block truncate max-w-full">
                {medicine.qrCodeValue}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
