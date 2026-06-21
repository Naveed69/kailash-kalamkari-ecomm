import React, { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import {
  MessageSquare,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  AlertCircle,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getInquiries, updateInquiryStatus, type ContactInquiry } from "@/lib/inquiriesApi";

const Inquiries = () => {
  const { toast } = useToast();
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [viewingInquiry, setViewingInquiry] = useState<ContactInquiry | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const itemsPerPage = 15;

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const { data, count } = await getInquiries(filter, search, page, itemsPerPage);
      setInquiries(data);
      setTotalCount(count);
    } catch {
      toast({ title: "Error", description: "Failed to load inquiries", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [filter, search, page, toast]);

  useEffect(() => { fetchInquiries(); }, [fetchInquiries]);

  const handleStatusUpdate = async (id: string, status: "new" | "solved" | "ignored") => {
    setProcessingId(id);
    try {
      await updateInquiryStatus(id, status);
      setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
      if (viewingInquiry?.id === id) setViewingInquiry((prev) => prev ? { ...prev, status } : null);
      toast({
        title: `Marked as ${status}`,
        className: status === "solved" ? "bg-green-50 border-green-200" : "bg-slate-50 border-slate-200",
      });
    } catch {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-2.5 py-1 flex items-center gap-1.5 w-fit rounded-full text-xs font-medium">
            <AlertCircle className="h-3 w-3" /> New
          </Badge>
        );
      case "solved":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 px-2.5 py-1 flex items-center gap-1.5 w-fit rounded-full text-xs font-medium">
            <CheckCircle2 className="h-3 w-3" /> Solved
          </Badge>
        );
      case "ignored":
        return (
          <Badge variant="outline" className="bg-slate-100 text-slate-500 border-slate-200 px-2.5 py-1 flex items-center gap-1.5 w-fit rounded-full text-xs font-medium">
            <XCircle className="h-3 w-3" /> Ignored
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const newCount = inquiries.filter((i) => i.status === "new").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6 md:p-8 space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-blue-500" />
            Inquiries
          </h1>
          <p className="text-slate-500 mt-1">
            Manage and respond to customer messages
            {newCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                {newCount} new
              </span>
            )}
          </p>
        </div>
        <Button
          onClick={fetchInquiries}
          disabled={loading}
          variant="outline"
          className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm h-10"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name, email, or subject..."
            className="pl-10 h-10 bg-slate-50 border-slate-200 focus:bg-white transition-all w-full rounded-xl"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="h-4 w-4 text-slate-400 hidden md:block shrink-0" />
          <Select value={filter} onValueChange={(v) => { setFilter(v); setPage(1); }}>
            <SelectTrigger className="w-full md:w-48 h-10 border-slate-200 bg-white rounded-xl">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="solved">Solved</SelectItem>
              <SelectItem value="ignored">Ignored</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-slate-100">
              <TableHead className="py-3 pl-6 text-xs font-semibold uppercase tracking-wider text-slate-500">Sender</TableHead>
              <TableHead className="py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 hidden md:table-cell">Subject</TableHead>
              <TableHead className="py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 hidden lg:table-cell">Message</TableHead>
              <TableHead className="py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</TableHead>
              <TableHead className="py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 hidden sm:table-cell">Date</TableHead>
              <TableHead className="py-3 pr-6 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
                    <span className="text-sm font-medium">Loading inquiries...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : inquiries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-56 text-center">
                  <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                    <div className="h-14 w-14 rounded-full bg-slate-50 flex items-center justify-center">
                      <MessageSquare className="h-7 w-7 text-slate-300" />
                    </div>
                    <p className="font-medium text-slate-500">No inquiries found</p>
                    <p className="text-sm text-slate-400">Adjust your filters or check back later.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              inquiries.map((inquiry) => (
                <TableRow
                  key={inquiry.id}
                  className={`group hover:bg-slate-50/80 transition-colors border-b border-slate-50 last:border-0 cursor-pointer ${
                    inquiry.status === "new" ? "bg-blue-50/20" : ""
                  }`}
                  onClick={() => setViewingInquiry(inquiry)}
                >
                  <TableCell className="py-3.5 pl-6 align-middle">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-slate-900 text-sm">{inquiry.name}</span>
                      <span className="text-xs text-slate-400 truncate max-w-[140px]">{inquiry.email}</span>
                      {inquiry.phone && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {inquiry.phone}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5 align-middle hidden md:table-cell">
                    <span className="text-sm font-medium text-slate-700 block truncate max-w-[150px]">
                      {inquiry.subject || "—"}
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5 align-middle hidden lg:table-cell">
                    <p className="text-sm text-slate-500 line-clamp-1 max-w-xs">{inquiry.message}</p>
                  </TableCell>
                  <TableCell className="py-3.5 align-middle">{getStatusBadge(inquiry.status)}</TableCell>
                  <TableCell className="py-3.5 align-middle hidden sm:table-cell">
                    <span className="text-sm text-slate-500">
                      {new Date(inquiry.created_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </span>
                  </TableCell>
                  <TableCell
                    className="py-3.5 pr-6 align-middle text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {inquiry.status !== "solved" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2.5 text-xs border-slate-200 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 rounded-lg gap-1"
                          onClick={() => handleStatusUpdate(inquiry.id, "solved")}
                          disabled={processingId === inquiry.id}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Solve
                        </Button>
                      )}
                      {inquiry.status !== "ignored" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2.5 text-xs border-slate-200 text-slate-600 hover:text-red-500 hover:bg-red-50 hover:border-red-100 rounded-lg gap-1"
                          onClick={() => handleStatusUpdate(inquiry.id, "ignored")}
                          disabled={processingId === inquiry.id}
                        >
                          <X className="h-3.5 w-3.5" /> Ignore
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalCount > itemsPerPage && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-medium text-slate-900">
                {Math.min((page - 1) * itemsPerPage + 1, totalCount)}–{Math.min(page * itemsPerPage, totalCount)}
              </span>{" "}
              of <span className="font-medium text-slate-900">{totalCount}</span> inquiries
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="h-8 w-8 p-0 rounded-lg border-slate-200"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pNum = i + 1;
                if (totalPages > 5) {
                  if (page <= 3) pNum = i + 1;
                  else if (page >= totalPages - 2) pNum = totalPages - 4 + i;
                  else pNum = page - 2 + i;
                }
                if (pNum > totalPages) return null;
                return (
                  <button
                    key={pNum}
                    onClick={() => setPage(pNum)}
                    className={`h-8 w-8 rounded-lg text-xs font-medium transition-all ${
                      page === pNum
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-500 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200"
                    }`}
                  >
                    {pNum}
                  </button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
                className="h-8 w-8 p-0 rounded-lg border-slate-200"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* View Inquiry Dialog */}
      <Dialog open={!!viewingInquiry} onOpenChange={(open) => { if (!open) setViewingInquiry(null); }}>
        <DialogContent className="sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              Inquiry Details
            </DialogTitle>
          </DialogHeader>
          {viewingInquiry && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">From</p>
                  <p className="font-semibold text-slate-900">{viewingInquiry.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Status</p>
                  {getStatusBadge(viewingInquiry.status)}
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Email</p>
                  <a href={`mailto:${viewingInquiry.email}`} className="text-blue-600 hover:underline text-sm flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" /> {viewingInquiry.email}
                  </a>
                </div>
                {viewingInquiry.phone && (
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Phone</p>
                    <a href={`tel:${viewingInquiry.phone}`} className="text-sm flex items-center gap-1 text-slate-700">
                      <Phone className="h-3.5 w-3.5" /> {viewingInquiry.phone}
                    </a>
                  </div>
                )}
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Date</p>
                  <p className="text-sm text-slate-700">
                    {new Date(viewingInquiry.created_at).toLocaleString("en-IN", {
                      day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              {viewingInquiry.subject && (
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Subject</p>
                  <p className="text-sm font-semibold text-slate-900">{viewingInquiry.subject}</p>
                </div>
              )}

              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">Message</p>
                <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 leading-relaxed border border-slate-100">
                  {viewingInquiry.message}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                {viewingInquiry.status !== "solved" && (
                  <Button
                    onClick={() => handleStatusUpdate(viewingInquiry.id, "solved")}
                    disabled={!!processingId}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Mark Solved
                  </Button>
                )}
                {viewingInquiry.status !== "ignored" && (
                  <Button
                    variant="outline"
                    onClick={() => handleStatusUpdate(viewingInquiry.id, "ignored")}
                    disabled={!!processingId}
                    className="flex-1 border-slate-200 text-slate-600 hover:text-red-500 hover:bg-red-50 hover:border-red-100 rounded-xl h-10"
                  >
                    <X className="mr-2 h-4 w-4" /> Ignore
                  </Button>
                )}
                <a
                  href={`mailto:${viewingInquiry.email}?subject=Re: ${viewingInquiry.subject || "Your Inquiry"}`}
                  className="flex-1"
                >
                  <Button variant="outline" className="w-full border-slate-200 rounded-xl h-10">
                    <Mail className="mr-2 h-4 w-4" /> Reply
                  </Button>
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inquiries;
