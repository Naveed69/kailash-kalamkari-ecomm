import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import Barcode from "react-barcode";
import { 
  createPackingSession, 
  updatePackingScanProgress, 
  completePackingSession, 
  cancelPackingSession, 
  getActivePackingSession 
} from "@/lib/adminApi";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Package, 
  PackageCheck, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  X,
  Loader2,
  ShoppingBag,
  Copy
} from "lucide-react";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  category?: string;
  barcode?: string; // Real product barcode
}

interface Order {
  id: number;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  items: OrderItem[];
  total_amount: number;
  status: string;
}

interface PackingModeProps {
  order: Order;
  onComplete: () => void;
  onCancel: () => void;
}

interface ScanStatus {
  [itemId: string]: number; // itemId -> scanned count
}

const PackingMode: React.FC<PackingModeProps> = ({ order, onComplete, onCancel }) => {
  const { toast } = useToast();
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  
  const [scannedItems, setScannedItems] = useState<ScanStatus>({});
  const [currentBarcode, setCurrentBarcode] = useState("");
  const [scanError, setScanError] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [lastScannedItem, setLastScannedItem] = useState<string | null>(null);
  const [packingSessionId, setPackingSessionId] = useState<number | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  // Initialize or resume packing session
  useEffect(() => {
    const initPackingSession = async () => {
      try {
        // FIRST: Always update order status to in_packing immediately
        console.log(`[PackingMode] Updating order #${order.id} status to in_packing...`);
        const { error: statusError } = await supabase
          .from("orders")
          .update({ status: "in_packing" })
          .eq("id", order.id);

        if (statusError) {
          console.error("[PackingMode] Error updating order status:", statusError);
          toast({
            title: "Warning",
            description: "Failed to update order status. Please try again.",
            variant: "destructive",
          });
        } else {
          console.log(`[PackingMode] Order #${order.id} status updated to in_packing successfully`);
        }

        // THEN: Try to create/resume packing session (optional)
        const { data: existingSession } = await getActivePackingSession(order.id);
        
        if (existingSession) {
          // Resume existing session
          setPackingSessionId(existingSession.id);
          setScannedItems(existingSession.scan_progress || {});
          toast({
            title: "Resuming Packing",
            description: "Continuing from your last session",
            className: "bg-blue-50 border-blue-200",
          });
        } else {
          // Create new session (if table exists)
          const adminEmail = import.meta.env.VITE_ADMIN_EMAILS?.split(',')[0] || 'admin@example.com';
          const { data: newSession, error } = await createPackingSession(order.id, adminEmail);
          
          if (error) {
            console.warn("Packing session not created (table may not exist):", error);
            // This is OK - we can still pack without the table
          } else if (newSession) {
            setPackingSessionId(newSession.id);
          }
        }
      } catch (error) {
        console.error("Error initializing packing session:", error);
        // Don't block packing if session creation fails
      } finally {
        setIsLoadingSession(false);
      }
    };

    initPackingSession();
  }, [order.id]);

  // Auto-focus barcode input on mount and after each scan
  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, [scannedItems]);

  // Calculate progress
  const totalItemsToScan = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalScanned = Object.values(scannedItems).reduce((sum, count) => sum + count, 0);
  const progressPercentage = (totalScanned / totalItemsToScan) * 100;
  const isAllScanned = totalScanned === totalItemsToScan;

  // Get item barcode - now uses real barcode from database
  const getItemBarcode = (item: OrderItem): string => {
    return item.barcode || item.id; // Use real barcode or fallback to ID
  };

  // Handle barcode scan/input
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentBarcode.trim()) {
      return;
    }

    const scannedBarcode = currentBarcode.trim();
    setScanError(null);
    setLastScannedItem(null);

    // Find matching item in order
    const matchingItem = order.items.find(item => 
      getItemBarcode(item) === scannedBarcode
    );

    if (!matchingItem) {
      // Wrong barcode - not in this order
      setScanError(`Wrong item! Barcode "${scannedBarcode}" not found in this order`);
      playErrorSound();
      
      toast({
        title: "❌ Wrong Item!",
        description: "This item is not in the current order",
        variant: "destructive",
      });
      
      setCurrentBarcode("");
      return;
    }

    // Check current scan count
    const currentCount = scannedItems[matchingItem.id] || 0;
    const requiredCount = matchingItem.quantity;

    if (currentCount >= requiredCount) {
      // Already scanned all required items
      setScanError(`Already scanned all ${requiredCount} ${matchingItem.name}`);
      playWarningSound();
      
      toast({
        title: "⚠ Already Scanned",
        description: `All ${requiredCount} items already scanned`,
        variant: "default",
      });
      
      setCurrentBarcode("");
      return;
    }

    // Valid scan - increment count
    const newCount = currentCount + 1;
    const updatedItems = {
      ...scannedItems,
      [matchingItem.id]: newCount
    };
    setScannedItems(updatedItems);

    // Persist scan progress to database
    if (packingSessionId) {
      updatePackingScanProgress(packingSessionId, updatedItems).catch(err => {
        console.error("Failed to save scan progress:", err);
      });
    }

    setLastScannedItem(matchingItem.id);
    playSuccessSound();

    toast({
      title: "✓ Item Scanned",
      description: `${matchingItem.name} (${newCount}/${requiredCount})`,
      className: "bg-green-50 border-green-200",
    });

    setCurrentBarcode("");
    
    // Auto-clear the highlight after 1.5 seconds
    setTimeout(() => {
      setLastScannedItem(null);
    }, 1500);
  };

  // Sound feedback functions
  const playSuccessSound = () => {
    const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBCdt0PLTgjMGHHDP8OOKRAoYZbbr5qRRDwc3iv/zyn4yBSJsyO/Xa0EJE1yw6OStWhELRKDi8bllHAU+j9vyxnksBSh3xvDek0MoKWK58OWoVA8GN4z+88V5KwUdcMfx5I5DCRRfs+jnrmMZCziRzu3HdSoDIWfE84pvMgoUYbPo5ahSDQc3iP7zxHgsBCBpyPLTfTIFI2+/8d6KPwsSXbTm67BfGAo/lunwy3gnBSBpyPLTfTIFI2+/8d6KPwsSXbTm67BfGAo/lunwy3gnBSBpyPLTfTIFI2+/8d6KPwsSXbTm67BfGAo/lunwy3gnBSBpyPLTfTIFI2+/8d6KPwsSXbTm67BfGAo/lunwy3gnBSBpyPLTfTIFI2+/8d6KPwsSXbTm67BfGAo/lunwy3gnBSBpyPLTfTIFI2+/8d6KPwsSXbTm67BfGAo/lunwy3gnBSBpyPLTfTIFI2+/8d6KPwsSXbTm67BfGAo/lunwy3gnBSBpyPLTfTIFI2+/8d6KPwsSXbTm67BfGAo/lunwy3gnBSBpyPLTfTIFI2+/8d6KPwsSXbTm67BfGAo/lunwy3gnBSBpyPLTfTIFI2+/8d6KPwsSXbTm67BfGAo/lunw==");
    audio.play().catch(() => {});
  };

  const playErrorSound = () => {
    const audio = new Audio("data:audio/wav;base64,UklGRhIAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YU4AAACB//9//wAAAIH//3//AAAA");
    audio.play().catch(() => {});
  };

  const playWarningSound = () => {
    const audio = new Audio("data:audio/wav;base64,UklGRhIAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YU4AAACB//9//wAAAIH//3//AAAA");
    audio.play().catch(() => {});
  };

  if (isLoadingSession) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#D49217] mx-auto"></div>
          <p className="text-lg text-gray-600">Initializing packing session...</p>
        </div>
      </div>
    );
  }

  // Get scan status for an item
  const getItemScanStatus = (item: OrderItem): { 
    scanned: number; 
    required: number; 
    isComplete: boolean; 
    isNext: boolean 
  } => {
    const scanned = scannedItems[item.id] || 0;
    const required = item.quantity;
    const isComplete = scanned >= required;
    
    // "Next" is the first incomplete item
    const firstIncomplete = order.items.find(i => 
      (scannedItems[i.id] || 0) < i.quantity
    );
    const isNext = !isComplete && firstIncomplete?.id === item.id;

    return { scanned, required, isComplete, isNext };
  };

  // Handle complete packing
  const handleCompletePacking = async () => {
    setIsCompleting(true);
    try {
      // ALWAYS update order status to packed (regardless of packing_sessions)
      const completedAt = new Date().toISOString();
      const { error: statusError } = await supabase
        .from("orders")
        .update({ 
          status: "packed",
          packed_at: completedAt
        })
        .eq("id", order.id);

      if (statusError) {
        throw statusError;
      }

      // THEN try to complete packing session (optional)
      if (packingSessionId) {
        await completePackingSession(packingSessionId).catch(err => {
          console.warn("Failed to complete packing session (table may not exist):", err);
          // This is OK - status is already updated
        });
      }

      toast({
        title: "✓ Packing Complete!",
        description: `Order #${order.id} is ready for shipping`,
        className: "bg-green-50 border-green-200",
      });

      setTimeout(() => {
        onComplete();
      }, 1000);
    } catch (error: any) {
      console.error("Error completing packing:", error);
      toast({
        title: "Error",
        description: "Failed to complete packing",
        variant: "destructive",
      });
    } finally {
      setIsCompleting(false);
    }
  };

  // Handle cancel packing
  const handleCancelPacking = async () => {
    if (packingSessionId) {
      await cancelPackingSession(packingSessionId).catch(err => {
        console.error("Failed to cancel session:", err);
      });
    }
    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-slate-50 z-50 overflow-auto">
      <div className="container mx-auto p-4 max-w-6xl">
        {/* Modern Header with Inline Scanner */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white rounded-xl p-5 mb-3 sticky top-0 z-10 shadow-2xl border border-slate-600">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-lg">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold tracking-tight">Order #{order.id}</div>
                <div className="text-sm text-slate-300">{order.customer_name} • {order.items.length} items</div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleCancelPacking}
              className="text-white hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Inline Scanner */}
          <form onSubmit={handleBarcodeSubmit} className="mb-3">
            <div className="flex gap-2">
              <Input
                ref={barcodeInputRef}
                type="text"
                value={currentBarcode}
                onChange={(e) => setCurrentBarcode(e.target.value)}
                placeholder="📷 Scan or type barcode..."
                className="text-xl font-mono h-12 bg-white/95 text-slate-900 placeholder:text-slate-500 border-white/20 focus:border-white focus:ring-2 focus:ring-white/50"
                autoFocus
              />
              <Button type="submit" size="lg" className="h-12 px-6 bg-emerald-600 hover:bg-emerald-700 text-white border-0">
                <CheckCircle2 className="h-5 w-5" />
              </Button>
            </div>
            {scanError && (
              <div className="mt-2 flex items-center gap-2 text-white text-sm bg-red-500/20 border border-red-400/30 p-2 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                {scanError}
              </div>
            )}
          </form>
          
          {/* Inline Progress */}
          <div className="flex items-center gap-3">
            <Progress value={progressPercentage} className="h-2.5 flex-1 bg-slate-600" />
            <span className="text-sm font-semibold min-w-[120px] text-right text-slate-100">
              {totalScanned}/{totalItemsToScan} • {Math.round(progressPercentage)}%
            </span>
          </div>
        </div>

        {/* Items Grid */}
        <div className="grid md:grid-cols-2 gap-3">
          {order.items.map((item) => {
            const status = getItemScanStatus(item);
            const isHighlighted = lastScannedItem === item.id;
            const itemBarcode = getItemBarcode(item);

            return (
              <Card
                key={item.id}
                className={`transition-all ${
                  status.isComplete
                    ? "border-emerald-500 bg-gradient-to-br from-emerald-50 to-green-50 shadow-md"
                    : status.isNext
                    ? "border-amber-400 border-l-4 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-xl ring-2 ring-amber-200"
                    : "border-slate-200 bg-white"
                } ${isHighlighted ? "ring-4 ring-emerald-400 scale-[1.02]" : ""}`}
              >
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    {/* Product Image */}
                    {item.image && (
                      <div className="flex-shrink-0">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg border-2 border-slate-200 shadow-sm"
                        />
                      </div>
                    )}
                    
                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm line-clamp-1 text-slate-800">{item.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            {item.category && (
                              <Badge variant="outline" className="text-xs border-slate-300 text-slate-600">{item.category}</Badge>
                            )}
                            <span className="text-sm font-bold text-slate-700">₹{item.price.toLocaleString()}</span>
                          </div>
                        </div>
                        <Badge className={`${
                          status.isComplete 
                            ? "bg-emerald-600 hover:bg-emerald-700" 
                            : status.isNext 
                            ? "bg-amber-500 hover:bg-amber-600 text-slate-900" 
                            : "bg-slate-400 hover:bg-slate-500"
                        }`}>
                          {status.scanned}/{status.required}
                        </Badge>
                      </div>
                      
                      {/* Barcode with Copy Button */}
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-slate-500 font-medium">Barcode:</span>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-xs"
                            onClick={() => {
                              navigator.clipboard.writeText(itemBarcode);
                              toast({
                                title: "Copied!",
                                description: `Barcode ${itemBarcode} copied to clipboard`,
                                className: "bg-blue-50 border-blue-200",
                              });
                            }}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                        </div>
                        <div className="bg-white rounded-md px-2 py-1 border border-slate-200">
                          <Barcode 
                            value={itemBarcode}
                            format="CODE128"
                            width={1.5}
                            height={35}
                            displayValue={true}
                            fontSize={10}
                            margin={0}
                          />
                        </div>
                      </div>
                      
                      {/* Status Indicator */}
                      {status.isNext && (
                        <div className="mt-2 text-xs text-center text-amber-900 font-semibold bg-amber-100 border border-amber-300 rounded-md px-2 py-1.5">
                          👆 SCAN NEXT ({status.required - status.scanned} more)
                        </div>
                      )}
                      {status.isComplete && (
                        <div className="mt-2 text-xs text-center text-emerald-800 font-semibold bg-emerald-100 border border-emerald-300 rounded-md px-2 py-1.5 flex items-center justify-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> COMPLETE
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-6">
          <Button
            onClick={handleCompletePacking}
            disabled={!isAllScanned || isCompleting}
            size="lg"
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            {isCompleting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Completing...
              </>
            ) : (
              <>
                <PackageCheck className="mr-2 h-5 w-5" />
                Complete Packing
              </>
            )}
          </Button>
          <Button
            onClick={() => setShowCancelDialog(true)}
            variant="outline"
            size="lg"
          >
            Cancel
          </Button>
        </div>

        {/* Cancel Confirmation Dialog */}
        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Packing?</AlertDialogTitle>
              <AlertDialogDescription>
                Progress will be lost. Are you sure you want to exit packing mode?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Go Back</AlertDialogCancel>
              <AlertDialogAction onClick={handleCancelPacking} className="bg-red-600 hover:bg-red-700">
                Yes, Cancel
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default PackingMode;
