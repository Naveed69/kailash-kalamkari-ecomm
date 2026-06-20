import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { MapPin, Plus, Trash2, Edit2, ArrowLeft, CheckCircle2, ShieldCheck, Loader2 } from "lucide-react";
import { getSavedAddresses, saveAddress, deleteAddress, setDefaultAddress, Address } from "@/lib/addressApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Badge } from "@/components/ui/badge";

const SavedAddresses = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  
  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<Address>({
    id: "",
    name: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
    isDefault: false
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login?returnTo=/saved-addresses');
    } else if (user) {
      loadAddresses();
    }
  }, [user, loading, navigate]);

  const loadAddresses = async () => {
    setLoadingData(true);
    try {
      const data = await getSavedAddresses();
      setAddresses(data);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to load addresses", variant: "destructive" });
    } finally {
      setLoadingData(false);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.phone || !/^\d{10}$/.test(formData.phone.trim().replace(/\s/g, '').replace('+91', ''))) {
      newErrors.phone = "Valid 10-digit phone required";
    }
    if (!formData.addressLine1) newErrors.addressLine1 = "Address line 1 is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.state) newErrors.state = "State is required";
    if (!formData.pincode || !/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = "Valid 6-digit pincode required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setProcessing(true);
    try {
      const addressToSave = { 
        ...formData, 
        id: isEditing ? formData.id : Date.now().toString() 
      };
      
      const { success, error } = await saveAddress(addressToSave);
      
      if (success) {
        toast({
          title: isEditing ? "Address Updated" : "Address Saved",
          className: "bg-green-50 border-green-200",
        });
        setIsDialogOpen(false);
        loadAddresses();
      } else {
        throw new Error(error?.message || "Failed to save");
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    
    setProcessing(true);
    try {
      const { success, error } = await deleteAddress(id);
      if (success) {
        toast({ title: "Address Deleted" });
        loadAddresses();
      } else {
        throw new Error(error?.message || "Failed to delete");
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    setProcessing(true);
    try {
      const { success, error } = await setDefaultAddress(id);
      if (success) {
        toast({ title: "Default Address Updated", className: "bg-green-50 border-green-200" });
        loadAddresses();
      } else {
        throw new Error(error?.message || "Failed to update default");
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const openNewDialog = () => {
    setFormData({
      id: "",
      name: user?.user_metadata?.full_name || "",
      phone: user?.phoneNumber || "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
      landmark: "",
      isDefault: addresses.length === 0
    });
    setErrors({});
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const openEditDialog = (address: Address) => {
    setFormData(address);
    setErrors({});
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  if (loading || loadingData) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin w-8 h-8 text-[#D49217]" /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/profile')} className="hover:bg-slate-200">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Saved Addresses</h1>
              <p className="text-slate-500">Manage your delivery locations</p>
            </div>
          </div>
          <Button onClick={openNewDialog} className="bg-[#D49217] hover:bg-[#C28315] text-white">
            <Plus className="w-4 h-4 mr-2" /> Add New Address
          </Button>
        </div>

        {/* Address List */}
        {addresses.length === 0 ? (
          <Card className="border-dashed border-2 shadow-none bg-slate-50/50">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                <MapPin className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Saved Addresses</h3>
              <p className="text-slate-500 mb-6 text-center max-w-sm">
                Add an address so you can check out faster on your next order.
              </p>
              <Button onClick={openNewDialog} className="bg-[#D49217] hover:bg-[#C28315] text-white">
                <Plus className="w-4 h-4 mr-2" /> Add Your First Address
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {addresses.map((addr) => (
              <Card key={addr.id} className={`border-2 transition-all ${addr.isDefault ? 'border-[#D49217] bg-amber-50/10' : 'border-transparent hover:border-slate-200 shadow-sm'}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      {addr.name}
                      {addr.isDefault && <Badge className="bg-[#D49217] hover:bg-[#D49217] text-white text-xs font-normal">Default</Badge>}
                    </CardTitle>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={() => openEditDialog(addr)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => handleDelete(addr.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {addr.addressLine1}
                    {addr.addressLine2 && <><br />{addr.addressLine2}</>}
                    <br />
                    {addr.city}, {addr.state} - {addr.pincode}
                    {addr.landmark && <><br /><span className="text-slate-500 italic">Near: {addr.landmark}</span></>}
                  </p>
                  <p className="mt-3 text-sm font-medium text-slate-800">
                    📞 {addr.phone}
                  </p>
                </CardContent>
                <CardFooter className="pt-0 flex justify-between items-center">
                  {!addr.isDefault ? (
                    <Button variant="link" className="px-0 text-slate-500 hover:text-[#D49217]" onClick={() => handleSetDefault(addr.id)}>
                      Set as Default
                    </Button>
                  ) : (
                    <div className="flex items-center text-sm text-[#D49217] font-medium">
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Default Address
                    </div>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Secure Note */}
        <div className="mt-12 flex items-center justify-center gap-2 text-sm text-slate-500">
          <ShieldCheck className="w-4 h-4 text-green-600" />
          Your addresses are stored securely and privately.
        </div>

        {/* Address Form Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md max-h-[90vh] p-0 overflow-hidden flex flex-col">
            <DialogHeader className="px-6 pt-6 pb-2">
              <DialogTitle>{isEditing ? "Edit Address" : "Add New Address"}</DialogTitle>
              <DialogDescription>
                Fill in the details for delivery.
              </DialogDescription>
            </DialogHeader>
            <div className="px-6 pb-6 flex-1 max-h-[60vh] overflow-y-auto">
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <Label>Full Name *</Label>
                    <Input 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})} 
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                  </div>
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <Label>Phone Number *</Label>
                    <Input 
                      value={formData.phone} 
                      onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                      maxLength={10}
                      className={errors.phone ? "border-red-500" : ""}
                    />
                    {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Address Line 1 *</Label>
                  <Input 
                    value={formData.addressLine1} 
                    onChange={(e) => setFormData({...formData, addressLine1: e.target.value})} 
                    placeholder="House No, Building, Street"
                    className={errors.addressLine1 ? "border-red-500" : ""}
                  />
                  {errors.addressLine1 && <p className="text-xs text-red-500">{errors.addressLine1}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Address Line 2 (Optional)</Label>
                  <Input 
                    value={formData.addressLine2} 
                    onChange={(e) => setFormData({...formData, addressLine2: e.target.value})} 
                    placeholder="Locality, Area"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>City *</Label>
                    <Input 
                      value={formData.city} 
                      onChange={(e) => setFormData({...formData, city: e.target.value})} 
                      className={errors.city ? "border-red-500" : ""}
                    />
                    {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Pincode *</Label>
                    <Input 
                      value={formData.pincode} 
                      onChange={(e) => setFormData({...formData, pincode: e.target.value})} 
                      maxLength={6}
                      className={errors.pincode ? "border-red-500" : ""}
                    />
                    {errors.pincode && <p className="text-xs text-red-500">{errors.pincode}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <Label>State *</Label>
                    <Input 
                      value={formData.state} 
                      onChange={(e) => setFormData({...formData, state: e.target.value})} 
                      className={errors.state ? "border-red-500" : ""}
                    />
                    {errors.state && <p className="text-xs text-red-500">{errors.state}</p>}
                  </div>
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <Label>Landmark (Optional)</Label>
                    <Input 
                      value={formData.landmark} 
                      onChange={(e) => setFormData({...formData, landmark: e.target.value})} 
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t bg-slate-50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={processing} className="bg-[#D49217] hover:bg-[#C28315] text-white">
                {processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {isEditing ? "Update Address" : "Save Address"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SavedAddresses;
