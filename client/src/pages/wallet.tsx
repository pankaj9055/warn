import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Wallet,
  Plus,
  CreditCard,
  History,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  Banknote,
  Gift,
  Smartphone,
  Bitcoin,
  Copy,
  QrCode,
  Upload
} from "lucide-react";

interface Transaction {
  id: number;
  type: string;
  amount: string;
  description: string;
  createdAt: string;
  status?: string;
}

interface PaymentMethod {
  id: number;
  name: string;
  type: string;
  config: any;
  qrCodeImage?: string;
  icon: string;
  description: string;
  minAmount: string;
  maxAmount: string;
  isActive: boolean;
}

export default function WalletPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [upiId, setUpiId] = useState("");
  const [cryptoTxHash, setCryptoTxHash] = useState("");
  const [paymentScreenshot, setPaymentScreenshot] = useState("");

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
    enabled: !!user,
  });

  const { data: paymentMethods = [], isLoading: paymentMethodsLoading } = useQuery<PaymentMethod[]>({
    queryKey: ["/api/payment-methods"],
    enabled: !!user,
  });

  const addFundsMutation = useMutation({
    mutationFn: async (amount: string) => {
      const response = await apiRequest("POST", "/api/wallet/add-funds", { amount });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        toast({
          title: "Funds Added",
          description: `₹${amount} has been added to your wallet.`,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
        queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
        setAmount("");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Add Funds",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const upiPaymentMutation = useMutation({
    mutationFn: async (data: { amount: string; upiId: string; paymentScreenshot?: string }) => {
      const response = await apiRequest("POST", "/api/payments/upi", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "✅ Payment Submit हो गया!",
        description: "Admin approve करेगा, 10 मिनट में balance add हो जाएगा।",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/payments/upi"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      setAmount("");
      setUpiId("");
      setPaymentScreenshot("");
      setSelectedPaymentMethod(null);
    },
    onError: (error: any) => {
      toast({
        title: "❌ Payment Failed",
        description: error.message || "कुछ गलत हुआ है, दोबारा try करें।",
        variant: "destructive",
      });
    },
  });

  const cryptoPaymentMutation = useMutation({
    mutationFn: async (data: { amount: string; currency: string; walletAddress: string; transactionHash?: string; exchangeRate: string }) => {
      const response = await apiRequest("POST", "/api/payments/crypto", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Crypto Payment Submitted",
        description: "Your payment is being verified. You'll receive confirmation once the transaction is confirmed on the blockchain.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/payments/crypto"] });
      setAmount("");
      setCryptoTxHash("");
      setSelectedPaymentMethod(null);
    },
    onError: (error: any) => {
      toast({
        title: "Crypto Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddFunds = () => {
    if (!amount || parseFloat(amount) < 10) {
      toast({
        title: "Invalid Amount",
        description: "Minimum amount is ₹10",
        variant: "destructive",
      });
      return;
    }
    addFundsMutation.mutate(amount);
  };

  const handleUpiPayment = () => {
    if (!amount || !upiId || !selectedPaymentMethod || !paymentScreenshot) {
      toast({
        title: "सभी Fields भरें ⚠️",
        description: "Amount, Transaction ID और Payment Screenshot सभी जरूरी हैं",
        variant: "destructive",
      });
      return;
    }
    
    const config = selectedPaymentMethod.config;
    upiPaymentMutation.mutate({
      amount,
      upiId,
      paymentScreenshot,
    });
  };

  const handleCryptoPayment = () => {
    if (!amount || !selectedPaymentMethod || !cryptoTxHash) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    const config = selectedPaymentMethod.config;
    cryptoPaymentMutation.mutate({
      amount,
      currency: config.currency,
      walletAddress: config.address,
      transactionHash: cryptoTxHash,
      exchangeRate: "1.00", // For INR, we'll use 1:1 for now
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Address copied to clipboard",
    });
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'upi': return <Smartphone className="text-green-400" size={20} />;
      case 'crypto': return <Bitcoin className="text-orange-400" size={20} />;
      default: return <CreditCard className="text-blue-400" size={20} />;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'deposit': return <ArrowUpRight className="text-green-400" size={16} />;
      case 'order': return <ArrowDownLeft className="text-red-400" size={16} />;
      case 'refund': return <TrendingUp className="text-blue-400" size={16} />;
      case 'referral': return <Gift className="text-purple-400" size={16} />;
      default: return <Banknote className="text-gray-400" size={16} />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'deposit': return 'text-green-400';
      case 'order': return 'text-red-400';
      case 'refund': return 'text-blue-400';
      case 'referral': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  if (!user) {
    return <div>Please login to view wallet</div>;
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="pt-20">
        {/* Header Section */}
        <section className="py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-2">
                <span className="gradient-text">My Wallet</span>
              </h1>
              <p className="text-gray-400">Manage your funds and transactions</p>
            </div>

            {/* Wallet Balance Card */}
            <div className="max-w-md mx-auto mb-8">
              <Card className="glass-card border-border/20 bg-gradient-to-br from-purple-900/30 to-pink-900/30">
                <CardContent className="text-center p-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Wallet className="text-white" size={24} />
                  </div>
                  <p className="text-sm text-gray-400 mb-2">Current Balance</p>
                  <p className="text-4xl font-bold gradient-text mb-4">
                    ₹{parseFloat(user.walletBalance).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">Available for spending</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Add Funds Section */}
        <section className="py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Quick Add Funds */}
              <Card className="glass-card border-border/20">
                <CardHeader>
                  <CardTitle className="gradient-text flex items-center">
                    <Plus className="mr-2" size={20} />
                    Add Funds
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-300 mb-2 block">Amount (₹)</label>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="neon-input bg-gray-900 border-gray-600 text-white"
                        min="10"
                        step="10"
                      />
                      <p className="text-xs text-gray-500 mt-1">Minimum amount: ₹10</p>
                    </div>

                    {/* Quick Amount Buttons */}
                    <div className="grid grid-cols-4 gap-2">
                      {['50', '100', '500', '1000'].map((quickAmount) => (
                        <Button
                          key={quickAmount}
                          variant="outline"
                          onClick={() => setAmount(quickAmount)}
                          className="border-gray-600 text-sm"
                        >
                          ₹{quickAmount}
                        </Button>
                      ))}
                    </div>

                    <Button
                      onClick={handleAddFunds}
                      disabled={true}
                      className="w-full neo-button opacity-50"
                    >
                      <CreditCard className="mr-2" size={16} />
                      Credit/Debit Card (Coming Soon)
                    </Button>

                    <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                      <p className="text-xs text-blue-300 mb-1">💡 Pro Tip:</p>
                      <p className="text-xs text-blue-200">
                        Refer friends and get ₹10 for every ₹50 they deposit!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Methods */}
              <Card className="glass-card border-border/20">
                <CardHeader>
                  <CardTitle className="gradient-text flex items-center">
                    <CreditCard className="mr-2" size={20} />
                    Payment Methods
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {paymentMethodsLoading ? (
                      <div className="flex justify-center py-4">
                        <LoadingSpinner size="sm" />
                      </div>
                    ) : (
                      paymentMethods.map((method) => (
                        <Dialog key={method.id}>
                          <DialogTrigger asChild>
                            <div 
                              className="p-4 border border-gray-600/30 rounded-lg bg-gray-900/20 hover:bg-gray-800/30 cursor-pointer transition-all duration-200 hover:border-purple-500/50"
                              onClick={() => setSelectedPaymentMethod(method)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                    method.type === 'upi' ? 'bg-green-500' : 
                                    method.type === 'crypto' ? 'bg-orange-500' : 'bg-blue-500'
                                  }`}>
                                    {getPaymentMethodIcon(method.type)}
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-white">{method.name}</h4>
                                    <p className="text-xs text-gray-400">{method.description}</p>
                                  </div>
                                </div>
                                <Badge variant="secondary" className="bg-green-900/30 text-green-300">
                                  {method.type === 'upi' ? 'Instant' : method.type === 'crypto' ? '5-30 min' : 'Coming Soon'}
                                </Badge>
                              </div>
                            </div>
                          </DialogTrigger>
                          <DialogContent className="max-w-md bg-gray-900 border-gray-700">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2 text-white">
                                {getPaymentMethodIcon(method.type)}
                                {method.name}
                              </DialogTitle>
                            </DialogHeader>
                            
                            {method.type === 'upi' ? (
                              <div className="space-y-4 pt-4">
                                <div className="text-center p-4 bg-green-900/20 rounded-lg border border-green-500/20">
                                  {method.qrCodeImage ? (
                                    <div className="mb-3">
                                      <img 
                                        src={method.qrCodeImage} 
                                        alt="Payment QR Code" 
                                        className="w-48 h-48 mx-auto object-contain border border-gray-600 rounded-lg bg-white p-2"
                                      />
                                    </div>
                                  ) : (
                                    <QrCode className="mx-auto mb-2 text-green-400" size={48} />
                                  )}
                                  <p className="text-sm text-green-300">Scan QR or use UPI ID</p>
                                  <div className="flex items-center justify-center gap-2 mt-2">
                                    <code className="text-green-400 font-mono text-sm">{method.config?.upi_id}</code>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => copyToClipboard(method.config?.upi_id)}
                                      className="text-green-400 hover:text-green-300"
                                    >
                                      <Copy size={14} />
                                    </Button>
                                  </div>
                                </div>
                                
                                <Input
                                  type="number"
                                  placeholder="Enter amount"
                                  value={amount}
                                  onChange={(e) => setAmount(e.target.value)}
                                  className="bg-gray-800 border-gray-600 text-white focus:border-green-500"
                                />
                                
                                <Input
                                  type="text"
                                  placeholder="Transaction ID (required)"
                                  value={upiId}
                                  onChange={(e) => setUpiId(e.target.value)}
                                  className="bg-gray-800 border-gray-600 text-white focus:border-green-500"
                                />

                                <div className="space-y-2">
                                  <label className="text-sm text-gray-300">Payment Screenshot (required)</label>
                                  <Input
                                    type="file"
                                    accept="image/*,video/*,.pdf,.doc,.docx,.txt,.zip,.rar"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const reader = new FileReader();
                                        reader.onload = () => setPaymentScreenshot(reader.result as string);
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                    className="bg-gray-800 border-gray-600 text-white focus:border-green-500"
                                  />
                                  {paymentScreenshot && (
                                    <div className="mt-2">
                                      <img 
                                        src={paymentScreenshot} 
                                        alt="Payment Screenshot" 
                                        className="max-w-32 max-h-32 object-cover rounded border border-gray-600"
                                      />
                                    </div>
                                  )}
                                </div>
                                
                                <Button
                                  onClick={handleUpiPayment}
                                  disabled={upiPaymentMutation.isPending}
                                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                                >
                                  {upiPaymentMutation.isPending ? (
                                    <>
                                      <LoadingSpinner size="sm" className="mr-2" />
                                      Submitting...
                                    </>
                                  ) : (
                                    <>
                                      <Smartphone className="mr-2" size={16} />
                                      Submit UPI Payment
                                    </>
                                  )}
                                </Button>
                                
                                <p className="text-xs text-gray-400 text-center">
                                  After payment, funds will be added within 10 minutes
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-4 pt-4">
                                <div className="text-center p-4 bg-orange-900/20 rounded-lg border border-orange-500/20">
                                  {method.qrCodeImage ? (
                                    <div className="mb-3">
                                      <img 
                                        src={method.qrCodeImage} 
                                        alt="Payment QR Code" 
                                        className="w-48 h-48 mx-auto object-contain border border-gray-600 rounded-lg bg-white p-2"
                                      />
                                    </div>
                                  ) : (
                                    <Bitcoin className="mx-auto mb-2 text-orange-400" size={48} />
                                  )}
                                  <p className="text-sm text-orange-300">Send {method.config?.currency} to:</p>
                                  <div className="flex items-center justify-center gap-2 mt-2">
                                    <code className="text-orange-400 font-mono text-xs break-all">{method.config?.address}</code>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => copyToClipboard(method.config?.address)}
                                      className="text-orange-400 hover:text-orange-300"
                                    >
                                      <Copy size={14} />
                                    </Button>
                                  </div>
                                </div>
                                
                                <Input
                                  type="number"
                                  placeholder="Enter amount in INR"
                                  value={amount}
                                  onChange={(e) => setAmount(e.target.value)}
                                  className="bg-gray-800 border-gray-600 text-white focus:border-orange-500"
                                />
                                
                                <Input
                                  type="text"
                                  placeholder="Transaction Hash (after sending)"
                                  value={cryptoTxHash}
                                  onChange={(e) => setCryptoTxHash(e.target.value)}
                                  className="bg-gray-800 border-gray-600 text-white focus:border-orange-500"
                                />
                                
                                <Button
                                  onClick={handleCryptoPayment}
                                  disabled={cryptoPaymentMutation.isPending}
                                  className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700"
                                >
                                  {cryptoPaymentMutation.isPending ? (
                                    <>
                                      <LoadingSpinner size="sm" className="mr-2" />
                                      Submitting...
                                    </>
                                  ) : (
                                    <>
                                      <Bitcoin className="mr-2" size={16} />
                                      Submit Crypto Payment
                                    </>
                                  )}
                                </Button>
                                
                                <p className="text-xs text-gray-400 text-center">
                                  Funds will be added after blockchain confirmation (5-30 minutes)
                                </p>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      ))
                    )}
                    
                    <div className="p-4 border border-purple-500/30 rounded-lg bg-purple-900/10">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                          <Gift className="text-white" size={16} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">Referral Bonus</h4>
                          <p className="text-xs text-gray-400">Earn ₹10-₹80 per referral</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Transaction History */}
        <section className="py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <Card className="glass-card border-border/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="gradient-text flex items-center">
                    <History className="mr-2" size={20} />
                    Transaction History
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      queryClient.setQueryData(["/api/transactions"], []);
                      toast({
                        title: "✅ Transaction History Cleared",
                        description: "सभी transactions clear हो गए।",
                      });
                    }}
                    className="border-red-500/30 text-red-400 hover:bg-red-900/20"
                  >
                    Clear History
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="mx-auto text-gray-500 mb-3" size={48} />
                    <p className="text-gray-400">No transactions yet</p>
                    <p className="text-sm text-gray-500">Your transaction history will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((transaction: any) => (
                      <div 
                        key={transaction.id}
                        className="flex items-center justify-between p-4 bg-dark-card rounded-lg border border-gray-700"
                      >
                        <div className="flex items-center space-x-3">
                          {getTransactionIcon(transaction.type)}
                          <div>
                            <p className="font-semibold text-white capitalize">
                              {transaction.type}
                            </p>
                            <p className="text-xs text-gray-400">
                              TXN ID: #{transaction.id.toString().padStart(6, '0')}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(transaction.createdAt).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })} • {new Date(transaction.createdAt).toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                            {transaction.type === 'order' ? '-' : '+'}₹{parseFloat(transaction.amount).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-400 max-w-32 break-words">
                            {transaction.description || 'Transaction'}
                          </p>
                          {transaction.referenceNumber && (
                            <p className="text-xs text-blue-400">
                              Ref: {transaction.referenceNumber}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}