import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Smartphone,
  Bitcoin,
  Eye,
  Edit,
  IndianRupee
} from "lucide-react";

export default function AdminPayments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
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
    onSuccess: () => {
      toast({ title: "UPI payment updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payments/upi"] });
      setDialogOpen(false);
      setSelectedPayment(null);
      setVerificationData({ amount: "", adminNotes: "", status: "verified" });
    },
  });

  const updateCryptoPaymentMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiRequest("PUT", `/api/admin/payments/crypto/${id}`, data),
    onSuccess: () => {
      toast({ title: "Crypto payment updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payments/crypto"] });
      setDialogOpen(false);
      setSelectedPayment(null);
      setVerificationData({ amount: "", adminNotes: "", status: "confirmed" });
    },
  });

  const handlePaymentAction = (payment: any, action: string) => {
    const updatedData = {
      status: action,
      amount: parseFloat(verificationData.amount) || payment.amount,
      adminNotes: verificationData.adminNotes
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
        return <Badge className="bg-green-500 text-white">Approved</Badge>;
      case "failed":
      case "rejected":
        return <Badge className="bg-red-500 text-white">Rejected</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500 text-black">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

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
                <p className="text-gray-400">Approve and manage user payment requests</p>
              </div>
            </div>

            <Tabs defaultValue="upi" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 bg-gray-800/50">
                <TabsTrigger value="upi" className="flex items-center space-x-2">
                  <Smartphone size={16} />
                  <span>UPI Payments</span>
                  {upiPayments.filter((p: any) => p.status === 'pending').length > 0 && (
                    <Badge className="bg-red-500 text-white text-xs">
                      {upiPayments.filter((p: any) => p.status === 'pending').length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="crypto" className="flex items-center space-x-2">
                  <Bitcoin size={16} />
                  <span>Crypto Payments</span>
                  {cryptoPayments.filter((p: any) => p.status === 'pending').length > 0 && (
                    <Badge className="bg-red-500 text-white text-xs">
                      {cryptoPayments.filter((p: any) => p.status === 'pending').length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upi">
                <Card className="glass-card border-border/20">
                  <CardHeader>
                    <CardTitle className="gradient-text flex items-center">
                      <Smartphone className="mr-2" size={20} />
                      UPI Payment Requests
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {upiLoading ? (
                      <div className="text-center py-8">Loading UPI payments...</div>
                    ) : upiPayments.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">No UPI payments found</div>
                    ) : (
                      <div className="space-y-4">
                        {upiPayments.map((payment: any) => (
                          <div key={payment.id} className="border border-gray-600/30 rounded-lg p-4 bg-gray-900/20">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <Avatar className="w-12 h-12">
                                  <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                                    {payment.user?.username?.charAt(0).toUpperCase() || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="font-semibold text-white">{payment.user?.username || 'Unknown User'}</h3>
                                  <p className="text-sm text-gray-400">UPI ID: {payment.upiId}</p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(payment.createdAt).toLocaleDateString()} • 
                                    {new Date(payment.createdAt).toLocaleTimeString()}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-4">
                                <div className="text-right">
                                  <div className="flex items-center space-x-1 text-green-400">
                                    <IndianRupee size={16} />
                                    <span className="font-bold text-lg">₹{payment.amount}</span>
                                  </div>
                                  {getStatusBadge(payment.status)}
                                </div>
                                
                                <div className="flex space-x-2">
                                  <Dialog open={dialogOpen && selectedPayment?.id === payment.id} onOpenChange={setDialogOpen}>
                                    <DialogTrigger asChild>
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="border-blue-500/30 text-blue-400"
                                        onClick={() => {
                                          setSelectedPayment({...payment, type: 'upi'});
                                          setVerificationData({
                                            amount: payment.amount.toString(),
                                            adminNotes: payment.adminNotes || "",
                                            status: "verified"
                                          });
                                        }}
                                      >
                                        <Eye size={14} className="mr-1" />
                                        Review
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="glass-card border-border/20 max-w-2xl">
                                      <DialogHeader>
                                        <DialogTitle className="gradient-text">UPI Payment Review</DialogTitle>
                                      </DialogHeader>
                                      
                                      <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <label className="text-sm font-medium text-gray-300">User</label>
                                            <p className="text-white">{payment.user?.username}</p>
                                          </div>
                                          <div>
                                            <label className="text-sm font-medium text-gray-300">UPI ID</label>
                                            <p className="text-white">{payment.upiId}</p>
                                          </div>
                                          <div>
                                            <label className="text-sm font-medium text-gray-300">Requested Amount</label>
                                            <p className="text-green-400 font-bold">₹{payment.amount}</p>
                                          </div>
                                          <div>
                                            <label className="text-sm font-medium text-gray-300">Transaction ID</label>
                                            <p className="text-white">{payment.transactionId || 'Not provided'}</p>
                                          </div>
                                        </div>

                                        {payment.paymentScreenshot && (
                                          <div>
                                            <label className="text-sm font-medium text-gray-300 mb-2 block">Payment Screenshot</label>
                                            <div className="relative group">
                                              <img 
                                                src={payment.paymentScreenshot} 
                                                alt="Payment Screenshot" 
                                                className="max-w-full max-h-64 object-contain rounded border border-gray-600 cursor-pointer hover:border-blue-500 transition-colors"
                                                onClick={() => {
                                                  // Create a modal to display the screenshot in full size
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
                                                  
                                                  const img = document.createElement('img');
                                                  img.src = payment.paymentScreenshot;
                                                  img.style.cssText = `
                                                    max-width: 95%;
                                                    max-height: 95%;
                                                    object-fit: contain;
                                                    border-radius: 8px;
                                                    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
                                                  `;
                                                  
                                                  modal.appendChild(img);
                                                  modal.onclick = () => document.body.removeChild(modal);
                                                  document.body.appendChild(modal);
                                                }}
                                              />
                                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded flex items-center justify-center">
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 text-white px-3 py-1 rounded text-sm">
                                                  Click to enlarge
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        )}

                                        <div className="space-y-4">
                                          <div>
                                            <label className="text-sm font-medium text-gray-300 mb-2 block">
                                              Approve Amount (₹)
                                            </label>
                                            <Input
                                              type="number"
                                              value={verificationData.amount}
                                              onChange={(e) => setVerificationData(prev => ({
                                                ...prev,
                                                amount: e.target.value
                                              }))}
                                              className="bg-gray-800 border-gray-600 text-white"
                                              placeholder="Enter amount to approve"
                                            />
                                          </div>
                                          
                                          <div>
                                            <label className="text-sm font-medium text-gray-300 mb-2 block">
                                              Admin Notes
                                            </label>
                                            <textarea
                                              value={verificationData.adminNotes}
                                              onChange={(e) => setVerificationData(prev => ({
                                                ...prev,
                                                adminNotes: e.target.value
                                              }))}
                                              className="w-full p-3 bg-gray-800 border border-gray-600 text-white rounded-lg resize-none focus:border-blue-500 focus:outline-none"
                                              placeholder="Add verification notes..."
                                              rows={3}
                                            />
                                          </div>
                                        </div>

                                        <div className="flex space-x-3">
                                          <Button
                                            onClick={() => handlePaymentAction(selectedPayment, "verified")}
                                            disabled={updateUpiPaymentMutation.isPending}
                                            className="flex-1 bg-green-600 hover:bg-green-700"
                                          >
                                            <CheckCircle size={16} className="mr-2" />
                                            Approve & Add to Wallet
                                          </Button>
                                          <Button
                                            onClick={() => handlePaymentAction(selectedPayment, "failed")}
                                            disabled={updateUpiPaymentMutation.isPending}
                                            variant="destructive"
                                            className="flex-1"
                                          >
                                            <XCircle size={16} className="mr-2" />
                                            Reject
                                          </Button>
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="crypto">
                <Card className="glass-card border-border/20">
                  <CardHeader>
                    <CardTitle className="gradient-text flex items-center">
                      <Bitcoin className="mr-2" size={20} />
                      Crypto Payment Requests
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {cryptoLoading ? (
                      <div className="text-center py-8">Loading crypto payments...</div>
                    ) : cryptoPayments.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">No crypto payments found</div>
                    ) : (
                      <div className="space-y-4">
                        {cryptoPayments.map((payment: any) => (
                          <div key={payment.id} className="border border-gray-600/30 rounded-lg p-4 bg-gray-900/20">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <Avatar className="w-12 h-12">
                                  <AvatarFallback className="bg-gradient-to-br from-orange-500 to-yellow-500 text-white">
                                    {payment.user?.username?.charAt(0).toUpperCase() || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="font-semibold text-white">{payment.user?.username || 'Unknown User'}</h3>
                                  <p className="text-sm text-gray-400">{payment.currency}: {payment.walletAddress}</p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(payment.createdAt).toLocaleDateString()} • 
                                    {new Date(payment.createdAt).toLocaleTimeString()}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-4">
                                <div className="text-right">
                                  <div className="flex items-center space-x-1 text-green-400">
                                    <IndianRupee size={16} />
                                    <span className="font-bold text-lg">₹{payment.amount}</span>
                                  </div>
                                  {getStatusBadge(payment.status)}
                                </div>
                                
                                <div className="flex space-x-2">
                                  <Dialog open={dialogOpen && selectedPayment?.id === payment.id} onOpenChange={setDialogOpen}>
                                    <DialogTrigger asChild>
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="border-blue-500/30 text-blue-400"
                                        onClick={() => {
                                          setSelectedPayment({...payment, type: 'crypto'});
                                          setVerificationData({
                                            amount: payment.amount.toString(),
                                            adminNotes: "",
                                            status: "confirmed"
                                          });
                                        }}
                                      >
                                        <Eye size={14} className="mr-1" />
                                        Review
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="glass-card border-border/20 max-w-2xl">
                                      <DialogHeader>
                                        <DialogTitle className="gradient-text">Crypto Payment Review</DialogTitle>
                                      </DialogHeader>
                                      
                                      <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <label className="text-sm font-medium text-gray-300">User</label>
                                            <p className="text-white">{payment.user?.username}</p>
                                          </div>
                                          <div>
                                            <label className="text-sm font-medium text-gray-300">Currency</label>
                                            <p className="text-white">{payment.currency}</p>
                                          </div>
                                          <div>
                                            <label className="text-sm font-medium text-gray-300">Wallet Address</label>
                                            <p className="text-white text-xs break-all">{payment.walletAddress}</p>
                                          </div>
                                          <div>
                                            <label className="text-sm font-medium text-gray-300">Transaction Hash</label>
                                            <p className="text-white text-xs break-all">{payment.transactionHash || 'Not provided'}</p>
                                          </div>
                                          <div>
                                            <label className="text-sm font-medium text-gray-300">Requested Amount</label>
                                            <p className="text-green-400 font-bold">₹{payment.amount}</p>
                                          </div>
                                          <div>
                                            <label className="text-sm font-medium text-gray-300">Exchange Rate</label>
                                            <p className="text-white">{payment.exchangeRate}</p>
                                          </div>
                                        </div>

                                        <div className="space-y-4">
                                          <div>
                                            <label className="text-sm font-medium text-gray-300 mb-2 block">
                                              Confirm Amount (₹)
                                            </label>
                                            <Input
                                              type="number"
                                              value={verificationData.amount}
                                              onChange={(e) => setVerificationData(prev => ({
                                                ...prev,
                                                amount: e.target.value
                                              }))}
                                              className="bg-gray-800 border-gray-600 text-white"
                                              placeholder="Enter amount to confirm"
                                            />
                                          </div>
                                          
                                          <div>
                                            <label className="text-sm font-medium text-gray-300 mb-2 block">
                                              Admin Notes
                                            </label>
                                            <textarea
                                              value={verificationData.adminNotes}
                                              onChange={(e) => setVerificationData(prev => ({
                                                ...prev,
                                                adminNotes: e.target.value
                                              }))}
                                              className="w-full p-3 bg-gray-800 border border-gray-600 text-white rounded-lg resize-none focus:border-blue-500 focus:outline-none"
                                              placeholder="Add confirmation notes..."
                                              rows={3}
                                            />
                                          </div>
                                        </div>

                                        <div className="flex space-x-3">
                                          <Button
                                            onClick={() => handlePaymentAction(selectedPayment, "confirmed")}
                                            disabled={updateCryptoPaymentMutation.isPending}
                                            className="flex-1 bg-green-600 hover:bg-green-700"
                                          >
                                            <CheckCircle size={16} className="mr-2" />
                                            Confirm & Add to Wallet
                                          </Button>
                                          <Button
                                            onClick={() => handlePaymentAction(selectedPayment, "failed")}
                                            disabled={updateCryptoPaymentMutation.isPending}
                                            variant="destructive"
                                            className="flex-1"
                                          >
                                            <XCircle size={16} className="mr-2" />
                                            Reject
                                          </Button>
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
    </div>
  );
}