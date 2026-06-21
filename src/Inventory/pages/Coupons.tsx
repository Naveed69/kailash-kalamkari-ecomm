import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  Plus,
  Tag,
  Loader2,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Calendar,
  IndianRupee,
  Percent,
  AlertCircle,
  CheckCircle2,
  Copy,
  Sparkles,
} from "lucide-react";
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponActive,
  type Coupon,
} from "@/lib/couponApi";

interface FormData {
  code: string;
  description: string;
  discount_type: "percentage" | "fixed";
  discount_value: string;
  min_order_amount: string;
  max_discount_amount: string;
  usage_limit: string;
  expires_at: string;
  is_active: boolean;
}

const defaultForm: FormData = {
  code: "",
  description: "",
  discount_type: "percentage",
  discount_value: "",
  min_order_amount: "",
  max_discount_amount: "",
  usage_limit: "",
  expires_at: "",
  is_active: true,
};

const Coupons = () => {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(defaultForm);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const data = await getCoupons();
      setCoupons(data);
    } catch {
      toast({ title: "Error", description: "Failed to load coupons", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const resetForm = () => {
    setFormData(defaultForm);
    setEditingCoupon(null);
    setShowForm(false);
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || "",
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value.toString(),
      min_order_amount: coupon.min_order_amount?.toString() || "",
      max_discount_amount: coupon.max_discount_amount?.toString() || "",
      usage_limit: coupon.usage_limit?.toString() || "",
      expires_at: coupon.expires_at ? coupon.expires_at.split("T")[0] : "",
      is_active: coupon.is_active,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      code: formData.code.toUpperCase().trim(),
      description: formData.description || null,
      discount_type: formData.discount_type,
      discount_value: parseFloat(formData.discount_value),
      min_order_amount: formData.min_order_amount ? parseFloat(formData.min_order_amount) : 0,
      max_discount_amount: formData.max_discount_amount ? parseFloat(formData.max_discount_amount) : null,
      usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
      expires_at: formData.expires_at || null,
      is_active: formData.is_active,
    };

    try {
      if (editingCoupon) {
        await updateCoupon(editingCoupon.id, payload);
        toast({ title: "Coupon Updated", description: `${payload.code} has been updated.`, className: "bg-green-50 border-green-200" });
      } else {
        await createCoupon(payload);
        toast({ title: "Coupon Created", description: `${payload.code} is now active!`, className: "bg-green-50 border-green-200" });
      }
      resetForm();
      fetchCoupons();
    } catch {
      toast({ title: "Error", description: editingCoupon ? "Failed to update coupon" : "Failed to create coupon", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteCoupon(id);
      toast({ title: "Coupon Deleted", className: "bg-red-50 border-red-200" });
      fetchCoupons();
    } catch {
      toast({ title: "Error", description: "Failed to delete coupon", variant: "destructive" });
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      await toggleCouponActive(coupon.id, coupon.is_active);
      toast({
        title: coupon.is_active ? "Coupon Deactivated" : "Coupon Activated",
        className: coupon.is_active ? "bg-slate-50 border-slate-200" : "bg-green-50 border-green-200",
      });
      fetchCoupons();
    } catch {
      toast({ title: "Error", description: "Failed to toggle coupon", variant: "destructive" });
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied!", description: `${code} copied to clipboard.` });
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const getUsagePercent = (used: number, limit: number | null) => {
    if (!limit) return 0;
    return Math.min(100, Math.round((used / limit) * 100));
  };

  const activeCoupons = coupons.filter((c) => c.is_active && !isExpired(c.expires_at));
  const inactiveCoupons = coupons.filter((c) => !c.is_active || isExpired(c.expires_at));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6 md:p-8 space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <Tag className="h-8 w-8 text-amber-500" />
            Coupons
          </h1>
          <p className="text-slate-500 mt-1">Create and manage discount codes for your store</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
            <span className="text-green-600 font-bold">{activeCoupons.length}</span> Active ·{" "}
            <span className="text-slate-400">{inactiveCoupons.length}</span> Inactive
          </div>
          <Button
            onClick={() => { setEditingCoupon(null); setFormData(defaultForm); setShowForm(true); }}
            className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg h-10 gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Add Coupon
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Coupons", value: coupons.length, color: "text-slate-900", bg: "bg-slate-50", border: "border-slate-200" },
          { label: "Active", value: activeCoupons.length, color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
          { label: "Inactive / Expired", value: inactiveCoupons.length, color: "text-slate-400", bg: "bg-slate-50", border: "border-slate-200" },
          { label: "Total Redemptions", value: coupons.reduce((acc, c) => acc + c.used_count, 0), color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
        ].map((stat) => (
          <Card key={stat.label} className={`${stat.bg} border ${stat.border} shadow-sm`}>
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-10 h-10 animate-spin text-slate-300" />
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="h-16 w-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Tag className="h-8 w-8 text-amber-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-700">No coupons yet</h3>
          <p className="text-slate-500 text-sm mt-2 mb-6">Create your first discount code to boost sales</p>
          <Button onClick={() => setShowForm(true)} className="bg-slate-900 hover:bg-slate-800 text-white">
            <Plus className="mr-2 h-4 w-4" /> Create First Coupon
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {coupons.map((coupon) => {
            const expired = isExpired(coupon.expires_at);
            const usagePct = getUsagePercent(coupon.used_count, coupon.usage_limit);
            return (
              <Card
                key={coupon.id}
                className={`border shadow-sm transition-all hover:shadow-md group overflow-hidden ${
                  !coupon.is_active || expired ? "opacity-60 bg-slate-50 border-slate-200" : "bg-white border-slate-200"
                }`}
              >
                <CardContent className="p-5 space-y-4">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => copyCode(coupon.code)}
                          className="group/copy flex items-center gap-1.5 font-mono text-lg font-bold text-slate-900 hover:text-amber-600 transition-colors"
                          title="Click to copy"
                        >
                          {coupon.code}
                          <Copy className="h-3.5 w-3.5 opacity-0 group-hover/copy:opacity-100 transition-opacity" />
                        </button>
                        {expired ? (
                          <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">Expired</Badge>
                        ) : coupon.is_active ? (
                          <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Active</Badge>
                        ) : (
                          <Badge className="bg-slate-100 text-slate-600 border-slate-200 text-xs">Inactive</Badge>
                        )}
                      </div>
                      {coupon.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{coupon.description}</p>
                      )}
                    </div>

                    {/* Discount chip */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5 flex items-center gap-1 shrink-0">
                      {coupon.discount_type === "percentage" ? (
                        <Percent className="h-3.5 w-3.5 text-amber-600" />
                      ) : (
                        <IndianRupee className="h-3.5 w-3.5 text-amber-600" />
                      )}
                      <span className="text-amber-700 font-bold text-sm">
                        {coupon.discount_type === "percentage"
                          ? `${coupon.discount_value}% OFF`
                          : `₹${coupon.discount_value} OFF`}
                      </span>
                    </div>
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {coupon.min_order_amount > 0 && (
                      <div className="bg-slate-50 rounded-lg p-2">
                        <p className="text-slate-400 font-medium mb-0.5">Min Order</p>
                        <p className="text-slate-700 font-bold">₹{coupon.min_order_amount}</p>
                      </div>
                    )}
                    {coupon.max_discount_amount && (
                      <div className="bg-slate-50 rounded-lg p-2">
                        <p className="text-slate-400 font-medium mb-0.5">Max Cap</p>
                        <p className="text-slate-700 font-bold">₹{coupon.max_discount_amount}</p>
                      </div>
                    )}
                    {coupon.expires_at && (
                      <div className="bg-slate-50 rounded-lg p-2">
                        <p className="text-slate-400 font-medium mb-0.5">Expires</p>
                        <p className={`font-bold ${expired ? "text-red-600" : "text-slate-700"}`}>
                          {new Date(coupon.expires_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    )}
                    <div className="bg-slate-50 rounded-lg p-2">
                      <p className="text-slate-400 font-medium mb-0.5">Used</p>
                      <p className="text-slate-700 font-bold">
                        {coupon.used_count}{coupon.usage_limit ? ` / ${coupon.usage_limit}` : " times"}
                      </p>
                    </div>
                  </div>

                  {/* Usage progress bar */}
                  {coupon.usage_limit && coupon.usage_limit > 0 && (
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Usage</span>
                        <span>{usagePct}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${usagePct >= 90 ? "bg-red-500" : usagePct >= 60 ? "bg-amber-500" : "bg-green-500"}`}
                          style={{ width: `${usagePct}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                    <button
                      onClick={() => handleToggleActive(coupon)}
                      className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                        coupon.is_active
                          ? "text-slate-500 hover:bg-slate-100"
                          : "text-green-600 hover:bg-green-50"
                      }`}
                    >
                      {coupon.is_active ? (
                        <ToggleRight className="h-4 w-4 text-green-500" />
                      ) : (
                        <ToggleLeft className="h-4 w-4 text-slate-400" />
                      )}
                      {coupon.is_active ? "Active" : "Inactive"}
                    </button>
                    <div className="flex-1" />
                    <button
                      onClick={() => handleEdit(coupon)}
                      className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(coupon.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      {deletingId === coupon.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => { if (!open) resetForm(); }}>
        <DialogContent className="sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              {editingCoupon ? <Pencil className="h-5 w-5 text-blue-600" /> : <Sparkles className="h-5 w-5 text-amber-500" />}
              {editingCoupon ? `Edit ${editingCoupon.code}` : "Create Coupon"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5 py-2">
            {/* Code */}
            <div className="space-y-2">
              <Label htmlFor="coupon-code">Coupon Code <span className="text-red-500">*</span></Label>
              <Input
                id="coupon-code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                required
                placeholder="SUMMER20"
                className="font-mono uppercase rounded-xl h-11 tracking-widest"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="coupon-desc">Description</Label>
              <Input
                id="coupon-desc"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Summer sale discount"
                className="rounded-xl h-11"
              />
            </div>

            {/* Discount Type & Value */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Discount Type <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.discount_type}
                  onValueChange={(v) => setFormData({ ...formData, discount_type: v as "percentage" | "fixed" })}
                >
                  <SelectTrigger className="rounded-xl h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="coupon-value">Value <span className="text-red-500">*</span></Label>
                <Input
                  id="coupon-value"
                  type="number"
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                  required
                  min="0"
                  step="0.01"
                  placeholder={formData.discount_type === "percentage" ? "20" : "500"}
                  className="rounded-xl h-11"
                />
              </div>
            </div>

            {/* Min Order & Max Cap */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min-order">Min Order Amount</Label>
                <Input
                  id="min-order"
                  type="number"
                  value={formData.min_order_amount}
                  onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                  min="0"
                  placeholder="₹1000"
                  className="rounded-xl h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-cap">Max Discount Cap</Label>
                <Input
                  id="max-cap"
                  type="number"
                  value={formData.max_discount_amount}
                  onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value })}
                  min="0"
                  placeholder="₹500"
                  className="rounded-xl h-11"
                />
              </div>
            </div>

            {/* Usage Limit & Expiry */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="usage-limit">Usage Limit</Label>
                <Input
                  id="usage-limit"
                  type="number"
                  value={formData.usage_limit}
                  onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                  min="1"
                  placeholder="100"
                  className="rounded-xl h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expires-at" className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Expires On
                </Label>
                <Input
                  id="expires-at"
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  className="rounded-xl h-11"
                />
              </div>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <input
                type="checkbox"
                id="is-active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 accent-slate-900"
              />
              <label htmlFor="is-active" className="text-sm text-slate-700 font-medium cursor-pointer">
                Active — coupon can be used immediately
              </label>
            </div>

            <DialogFooter className="gap-3">
              <Button type="button" variant="outline" onClick={resetForm} className="rounded-xl h-11 flex-1">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-11 flex-1 shadow-md"
              >
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editingCoupon ? "Update Coupon" : "Create Coupon"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={!!confirmDeleteId} onOpenChange={(open) => { if (!open) setConfirmDeleteId(null); }}>
        <DialogContent className="sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Delete Coupon?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">This action cannot be undone. The coupon will be permanently removed.</p>
          <DialogFooter className="gap-3 mt-4">
            <Button variant="outline" onClick={() => setConfirmDeleteId(null)} className="rounded-xl h-10 flex-1">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
              className="rounded-xl h-10 flex-1"
              disabled={!!deletingId}
            >
              {deletingId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Coupons;
