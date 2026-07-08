import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { useCreateMedicine } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

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

export default function NewMedicine() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createMutation = useCreateMedicine();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "", batchNumber: "", manufacturer: "", manufacturingDate: "",
      expiryDate: "", quantity: 1, storageLocation: "", category: "", qrCodeValue: ""
    }
  });

  const onSubmit = (values: z.infer<typeof schema>) => {
    createMutation.mutate({ data: values }, {
      onSuccess: (res) => {
        toast({ title: "Medicine added successfully" });
        setLocation(`/medicines/${res.id}`);
      },
      onError: () => {
        toast({ title: "Failed to add medicine", variant: "destructive" });
      }
    });
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => setLocation("/medicines")} className="gap-2 -ml-4">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Add New Medicine</CardTitle>
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
              <Button type="submit" disabled={createMutation.isPending} className="w-full mt-6">
                {createMutation.isPending ? "Saving..." : "Save Medicine"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
