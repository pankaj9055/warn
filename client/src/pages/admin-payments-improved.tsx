import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Smartphone, Bitcoin, Clock, CheckCircle, XCircle, Eye, User, Calendar, DollarSign } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

export default function AdminPayments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [verificationData, setVerificationData] = useState({
    amount: "",
    adminNotes: "",
    status: "verified"
  });

  const { data: upiPayments = [], isLoading: upiLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/payments/upi"],
    enabled: !!user?.isAdmin,
  });

  const { data: cryptoPayments = [], isLoading: cryptoLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/payments/crypto"],
    enabled: !!user?.isAdmin,
  });

  const updateUpiPaymentMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiRequest("PUT", `/api/admin/payments/upi/${id}`, data),
    onSuccess: (data, variables) => {
      const isApproval = variables.data.status === 'verified';
      toast({ 
        title: isApproval ? "✅ Payment Approved" : "❌ Payment Rejected",
        description: isApproval ? "UPI payment approved! User ka balance add ho gaya." : "UPI payment rejected successfully."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payments/upi"] });
      setDialogOpen(false);
      setSelectedPayment(null);
      setVerificationData({ amount: "", adminNotes: "", status: "verified" });
    },
  });

  const updateCryptoPaymentMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiRequest("PUT", `/api/admin/payments/crypto/${id}`, data),
    onSuccess: (data, variables) => {
      const isApproval = variables.data.status === 'confirmed';
      toast({ 
        title: isApproval ? "✅ Crypto Payment Approved" : "❌ Crypto Payment Rejected", 
        description: isApproval ? "Crypto payment confirmed! User ka balance add ho gaya." : "Crypto payment rejected successfully."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payments/crypto"] });
      setDialogOpen(false);
      setSelectedPayment(null);
      setVerificationData({ amount: "", adminNotes: "", status: "confirmed" });
    },
  });

  // 1-click approval function
  const handleQuickApproval = (payment: any, type: string) => {
    // Check if already processed to prevent duplicates
    if (payment.status !== 'pending') {
      toast({ 
        title: "⚠️ Already Processed", 
        description: "This payment has already been processed.",
        variant: "destructive"
      });
      return;
    }

    const isReject = payment.status === 'rejected';
    const updatedData = {
      status: isReject ? 'rejected' : (type === 'upi' ? 'verified' : 'confirmed'),
      amount: payment.amount,
      adminNotes: isReject ? `Quick rejected by ${user?.username}` : `Quick approved by ${user?.username}`,
      verifiedBy: user?.id,
      verifiedAt: new Date().toISOString()
    };

    if (type === "upi") {
      updateUpiPaymentMutation.mutate({ id: payment.id, data: updatedData });
    } else if (type === "crypto") {
      updateCryptoPaymentMutation.mutate({ id: payment.id, data: updatedData });
    }
  };

  const handlePaymentAction = (payment: any, action: string) => {
    const updatedData = {
      status: action,
      amount: parseFloat(verificationData.amount) || payment.amount,
      adminNotes: verificationData.adminNotes,
      verifiedBy: user?.id,
      verifiedAt: new Date().toISOString()
    };

    if (payment.type === "upi") {
      updateUpiPaymentMutation.mutate({ id: payment.id, data: updatedData });
    } else {
      updateCryptoPaymentMutation.mutate({ id: payment.id, data: updatedData });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
      case "confirmed":
        return <Badge className="bg-green-500 text-white flex items-center gap-1"><CheckCircle size={12} />Approved</Badge>;
      case "failed":
      case "rejected":
        return <Badge className="bg-red-500 text-white flex items-center gap-1"><XCircle size={12} />Rejected</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500 text-black flex items-center gap-1"><Clock size={12} />Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filterPaymentsByStatus = (payments: any[], status: string) => {
    return payments.filter(p => p.status === status);
  };

  const renderPaymentCard = (payment: any, type: string) => (
    <div key={payment.id} className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <User size={20} />
          </div>
          <div>
            <div className="font-medium">User ID: {payment.userId}</div>
            <div className="text-sm text-gray-400 flex items-center gap-1">
              <Calendar size={12} />
              {format(new Date(payment.createdAt), "MMM dd, yyyy HH:mm")}
            </div>
          </div>
        </div>
        <div className="text-right">
          {getStatusBadge(payment.status)}
          <div className="text-lg font-bold text-green-400 mt-1 flex items-center gap-1">
            <DollarSign size={16} />
            ₹{payment.amount}
          </div>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        {type === "upi" ? (
          <>
            <div><span className="text-gray-400">UPI ID:</span> {payment.upiId}</div>
            {payment.transactionId && (
              <div><span className="text-gray-400">Transaction ID:</span> {payment.transactionId}</div>
            )}
          </>
        ) : (
          <>
            <div><span className="text-gray-400">Currency:</span> {payment.currency}</div>
            <div><span className="text-gray-400">Wallet:</span> {payment.walletAddress?.substring(0, 20)}...</div>
            {payment.transactionHash && (
              <div><span className="text-gray-400">TX Hash:</span> {payment.transactionHash?.substring(0, 20)}...</div>
            )}
          </>
        )}
        
        {payment.adminNotes && (
          <div className="mt-2 p-2 bg-blue-500/10 rounded border-l-2 border-blue-500">
            <span className="text-gray-400">Admin Notes:</span> {payment.adminNotes}
          </div>
        )}
      </div>

      {payment.status === "pending" && (
        <div className="flex gap-2 mt-4">
          <Button
            size="sm"
            onClick={() => handleQuickApproval(payment, type)}
            disabled={updateUpiPaymentMutation.isPending || updateCryptoPaymentMutation.isPending}
            className="bg-green-600 hover:bg-green-700 flex-1"
          >
            <CheckCircle size={14} className="mr-1" />
            {updateUpiPaymentMutation.isPending || updateCryptoPaymentMutation.isPending ? "Approving..." : "✓ Quick Approve"}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              const rejectData = {
                status: 'rejected',
                amount: payment.amount,
                adminNotes: `Quick rejected by ${user?.username}`,
                verifiedBy: user?.id,
                verifiedAt: new Date().toISOString()
              };
              if (type === "upi") {
                updateUpiPaymentMutation.mutate({ id: payment.id, data: rejectData });
              } else {
                updateCryptoPaymentMutation.mutate({ id: payment.id, data: rejectData });
              }
            }}
            disabled={updateUpiPaymentMutation.isPending || updateCryptoPaymentMutation.isPending}
            className="flex-1"
          >
            <XCircle size={14} className="mr-1" />
            Quick Reject
          </Button>
          {payment.paymentScreenshot && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                // Create a modal to display the screenshot properly
                const modal = document.createElement('div');
                modal.style.cssText = `
                  position: fixed;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  background: rgba(0,0,0,0.9);
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  z-index: 10000;
                  cursor: pointer;
                `;
                
                // Add close button
                const closeBtn = document.createElement('div');
                closeBtn.innerHTML = '✕';
                closeBtn.style.cssText = `
                  position: absolute;
                  top: 20px;
                  right: 20px;
                  color: white;
                  font-size: 24px;
                  font-weight: bold;
                  cursor: pointer;
                  background: rgba(0,0,0,0.7);
                  border-radius: 50%;
                  width: 40px;
                  height: 40px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  z-index: 10001;
                `;
                
                const img = document.createElement('img');
                img.src = payment.paymentScreenshot;
                img.style.cssText = `
                  max-width: 90%;
                  max-height: 90%;
                  object-fit: contain;
                  border-radius: 8px;
                  box-shadow: 0 4px 20px rgba(0,0,0,0.5);
                  cursor: default;
                `;
                
                // Prevent image click from closing modal
                img.onclick = (e) => e.stopPropagation();
                
                modal.appendChild(closeBtn);
                modal.appendChild(img);
                
                // Close modal function
                const closeModal = () => {
                  if (document.body.contains(modal)) {
                    document.body.removeChild(modal);
                  }
                };
                
                modal.onclick = closeModal;
                closeBtn.onclick = closeModal;
                
                // Add ESC key listener
                const handleEsc = (e: KeyboardEvent) => {
                  if (e.key === 'Escape') {
                    closeModal();
                    document.removeEventListener('keydown', handleEsc);
                  }
                };
                document.addEventListener('keydown', handleEsc);
                
                document.body.appendChild(modal);
              }}
            >
              <Eye size={14} className="mr-1" />
              View Screenshot
            </Button>
          )}
        </div>
      )}
    </div>
  );

  const renderPaymentSection = (payments: any[], type: string, loading: boolean) => (
    <Tabs defaultValue="pending" className="space-y-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="pending" className="flex items-center gap-2">
          <Clock size={14} />
          Pending ({filterPaymentsByStatus(payments, "pending").length})
        </TabsTrigger>
        <TabsTrigger value="approved" className="flex items-center gap-2">
          <CheckCircle size={14} />
          Approved ({filterPaymentsByStatus(payments, type === "upi" ? "verified" : "confirmed").length})
        </TabsTrigger>
        <TabsTrigger value="rejected" className="flex items-center gap-2">
          <XCircle size={14} />
          Rejected ({filterPaymentsByStatus(payments, "rejected").length})
        </TabsTrigger>
      </TabsList>

      {["pending", "approved", "rejected"].map(status => {
        const statusKey = status === "approved" ? (type === "upi" ? "verified" : "confirmed") : status;
        const filteredPayments = filterPaymentsByStatus(payments, statusKey);
        
        return (
          <TabsContent key={status} value={status}>
            <Card className="glass-card border-border/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  {status === "pending" && <Clock className="h-5 w-5 text-yellow-400" />}
                  {status === "approved" && <CheckCircle className="h-5 w-5 text-green-400" />}
                  {status === "rejected" && <XCircle className="h-5 w-5 text-red-400" />}
                  {status.charAt(0).toUpperCase() + status.slice(1)} {type.toUpperCase()} Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : filteredPayments.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    No {status} {type} payments found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredPayments.map((payment: any) => renderPaymentCard(payment, type))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        );
      })}
    </Tabs>
  );

  if (!user?.isAdmin) return null;

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="pt-20">
        <section className="py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  <span className="gradient-text">Payment Approvals</span>
                </h1>
                <p className="text-gray-400">Review and manage user payment requests by status</p>
              </div>
            </div>

            <Tabs defaultValue="upi" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 bg-gray-800/50">
                <TabsTrigger value="upi" className="flex items-center space-x-2">
                  <Smartphone size={16} />
                  <span>UPI Payments</span>
                  {filterPaymentsByStatus(upiPayments, "pending").length > 0 && (
                    <Badge className="bg-red-500 text-white text-xs">
                      {filterPaymentsByStatus(upiPayments, "pending").length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="crypto" className="flex items-center space-x-2">
                  <Bitcoin size={16} />
                  <span>Crypto Payments</span>
                  {filterPaymentsByStatus(cryptoPayments, "pending").length > 0 && (
                    <Badge className="bg-red-500 text-white text-xs">
                      {filterPaymentsByStatus(cryptoPayments, "pending").length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upi">
                {renderPaymentSection(upiPayments, "upi", upiLoading)}
              </TabsContent>

              <TabsContent value="crypto">
                {renderPaymentSection(cryptoPayments, "crypto", cryptoLoading)}
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>

      {/* Payment Action Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {verificationData.status === "rejected" ? "Reject Payment" : "Approve Payment"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                value={verificationData.amount}
                onChange={(e) => setVerificationData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="Enter amount"
              />
            </div>
            <div>
              <Label htmlFor="notes">Admin Notes</Label>
              <Textarea
                id="notes"
                value={verificationData.adminNotes}
                onChange={(e) => setVerificationData(prev => ({ ...prev, adminNotes: e.target.value }))}
                placeholder={verificationData.status === "rejected" ? "Reason for rejection..." : "Optional notes..."}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handlePaymentAction(selectedPayment, verificationData.status)}
                disabled={updateUpiPaymentMutation.isPending || updateCryptoPaymentMutation.isPending}
                className={verificationData.status === "rejected" ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
              >
                {updateUpiPaymentMutation.isPending || updateCryptoPaymentMutation.isPending 
                  ? "Processing..." 
                  : (verificationData.status === "rejected" ? "Reject Payment" : "Approve Payment")
                }
              </Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}