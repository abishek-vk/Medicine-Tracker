import React, { useState } from "react";
import { useLookupMedicineByQrCode } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { ScanBarcode, Search } from "lucide-react";
import { Link } from "wouter";

export default function Scanner() {
  const [inputValue, setInputValue] = useState("");
  const [searchValue, setSearchValue] = useState("");

  const { data: medicine, error, isFetching } = useLookupMedicineByQrCode(searchValue, {
    query: {
      enabled: !!searchValue,
      queryKey: ["lookup", searchValue],
      retry: false
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setSearchValue(inputValue.trim());
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8 flex flex-col items-center mt-12">
      <div className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <ScanBarcode className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">QR Code Scanner</h1>
        <p className="text-muted-foreground">Scan or enter a QR code to look up a medicine instantly.</p>
      </div>

      <form onSubmit={handleSearch} className="w-full flex gap-2">
        <Input 
          className="text-lg py-6"
          placeholder="Enter QR Code..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <Button type="submit" size="lg" className="px-8 h-auto" disabled={isFetching}>
          <Search className="h-5 w-5 mr-2" />
          Lookup
        </Button>
      </form>

      <div className="w-full">
        {isFetching && <div className="text-center p-8">Searching...</div>}
        
        {error && !isFetching && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="p-8 text-center space-y-4">
              <div className="text-xl font-semibold text-destructive">Medicine Not Found</div>
              <p className="text-muted-foreground">No medicine found matching QR code "{searchValue}"</p>
              <Link href="/medicines/new">
                <Button variant="outline">Add New Medicine</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {medicine && !isFetching && (
          <Card className="animate-in slide-in-from-bottom-4">
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{medicine.name}</h2>
                  <p className="text-muted-foreground font-mono">{medicine.batchNumber}</p>
                </div>
                <StatusBadge status={medicine.status} className="text-lg px-4 py-1" />
              </div>
              
              <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm bg-secondary/50 p-4 rounded-lg">
                <div>
                  <span className="text-muted-foreground block mb-1">Manufacturer</span>
                  <span className="font-medium">{medicine.manufacturer}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Quantity</span>
                  <span className="font-medium">{medicine.quantity}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Expiry Date</span>
                  <span className="font-medium">{new Date(medicine.expiryDate).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Location</span>
                  <span className="font-medium">{medicine.storageLocation}</span>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Link href={`/medicines/${medicine.id}`}>
                  <Button>View Full Details</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
