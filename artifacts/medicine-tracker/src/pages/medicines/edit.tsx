import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useParams } from "wouter";
import { useGetMedicine, useUpdateMedicine } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const schema = z.object({
  name: z.string().min(1, "Required"),
  batchNumber: z.string().min(1, "Required"),
  manufacturer: z.string().min(1, "Required"),
  manufacturingDate: z.string().min(1, "Required"),
  expiryDate: z.string().min(1, "Required"),
  quantity: z.coerce.number().min(1, "Must be > 0"),
  storageLocation: z.string().min(1, "Required"),
  category: z.string().min(1, "Required"),
  qrCodeValue: z.string().min(1, "Required"),
}).refine((data) => new Date(data.expiryDate) > new Date(data.manufacturingDate), {
  message: "Expiry date must be after manufacturing date",
  path: ["expiryDate"],
});

export default function EditMedicine() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: medicine, isLoading } = useGetMedicine(id!);
  const updateMutation = useUpdateMedicine();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "", batchNumber: "", manufacturer: "", manufacturingDate: "",
      expiryDate: "", quantity: 1, storageLocation: "", category: "", qrCodeValue: ""
    }
  });

  useEffect(() => {
    if (medicine) {
      form.reset({
        name: medicine.name,
        batchNumber: medicine.batchNumber,
        manufacturer: medicine.manufacturer,
        manufacturingDate: new Date(medicine.manufacturingDate).toISOString().split('T')[0],
        expiryDate: new Date(medicine.expiryDate).toISOString().split('T')[0],
        quantity: medicine.quantity,
        storageLocation: medicine.storageLocation,
        category: medicine.category,
        qrCodeValue: medicine.qrCodeValue,
      });
    }
  }, [medicine, form]);

  const onSubmit = (values: z.infer<typeof schema>) => {
    updateMutation.mutate({ id: id!, data: values }, {
      onSuccess: () => {
        toast({ title: "Medicine updated successfully" });
        setLocation(`/medicines/${id}`);
      },
      onError: () => {
        toast({ title: "Failed to update medicine", variant: "destructive" });
      }
    });
  };

  if (isLoading) {
    return <div className="p-8"><Skeleton className="h-96 w-full" /></div>;
  }

  if (!medicine) {
    return <div className="p-8 text-center">Medicine not found.</div>;
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => setLocation(`/medicines/${id}`)} className="gap-2 -ml-4">
        <ArrowLeft className="h-4 w-4" /> Back to Details
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Edit Medicine</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="batchNumber" render={({ field }) => (
                  <FormItem><FormLabel>Batch Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="manufacturer" render={({ field }) => (
                  <FormItem><FormLabel>Manufacturer</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem><FormLabel>Category</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="manufacturingDate" render={({ field }) => (
                  <FormItem><FormLabel>Manufacturing Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="expiryDate" render={({ field }) => (
                  <FormItem><FormLabel>Expiry Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="quantity" render={({ field }) => (
                  <FormItem><FormLabel>Quantity</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="storageLocation" render={({ field }) => (
                  <FormItem><FormLabel>Storage Location</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="qrCodeValue" render={({ field }) => (
                  <FormItem className="col-span-2"><FormLabel>QR Code Value</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <Button type="submit" disabled={updateMutation.isPending} className="w-full mt-6">
                {updateMutation.isPending ? "Saving..." : "Update Medicine"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
