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
import { 
  CreditCard,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Wallet,
  Bitcoin,
  Upload,
  Image as ImageIcon
} from "lucide-react";

interface PaymentMethod {
  id: number;
  name: string;
  type: string;
  isActive: boolean;
  config: any;
  qrCodeImage?: string;
  icon: string;
  description: string;
  minAmount: string;
  maxAmount: string;
  processingFee: string;
  createdAt: string;
}

export default function AdminPaymentMethodsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [newMethod, setNewMethod] = useState({
    name: "",
    type: "upi",
    description: "",
    config: {},
    qrCodeImage: "",
    minAmount: "10.00",
    maxAmount: "50000.00",
    processingFee: "0.00",
    isActive: true
  });

  const { data: paymentMethods = [], isLoading } = useQuery<PaymentMethod[]>({
    queryKey: ["/api/admin/payment-methods"],
    enabled: !!user?.isAdmin,
  });

  const addMethodMutation = useMutation({
    mutationFn: async (methodData: any) => {
      const response = await apiRequest("POST", "/api/admin/payment-methods", methodData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Payment Method Added",
        description: "New payment method has been added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payment-methods"] });
      setIsAddingNew(false);
      setNewMethod({ 
        name: "", 
        type: "upi", 
        description: "", 
        config: {}, 
        qrCodeImage: "",
        minAmount: "10.00",
        maxAmount: "50000.00",
        processingFee: "0.00",
        isActive: true 
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Add Method",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMethodMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const response = await apiRequest("PUT", `/api/admin/payment-methods/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Payment Method Updated",
        description: "Payment method has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payment-methods"] });
      setEditingId(null);
      setEditingMethod(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Update Method",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMethodMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/payment-methods/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Payment Method Deleted",
        description: "Payment method has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payment-methods"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Delete Method",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddMethod = () => {
    if (!newMethod.name || !newMethod.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    const methodData = {
      ...newMethod,
      config: newMethod.type === 'upi' 
        ? { upi_id: newMethod.description } 
        : { wallet_address: newMethod.description, network: "BSC", currency: "USDT" }
    };
    
    addMethodMutation.mutate(methodData);
  };

  const handleEditMethod = (method: PaymentMethod) => {
    setEditingId(method.id);
    setEditingMethod(method);
  };

  const handleSaveEdit = () => {
    if (!editingMethod) return;
    
    const updatedConfig = editingMethod.type === 'upi' 
      ? { upi_id: editingMethod.description } 
      : { wallet_address: editingMethod.description, network: "BSC", currency: "USDT" };
    
    updateMethodMutation.mutate({
      id: editingMethod.id,
      ...editingMethod,
      config: updatedConfig
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingMethod(null);
  };

  const getMethodIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'upi': return <Wallet className="text-green-400" size={20} />;
      case 'crypto': return <Bitcoin className="text-orange-400" size={20} />;
      default: return <CreditCard className="text-blue-400" size={20} />;
    }
  };

  if (!user?.isAdmin) {
    return <div className="text-center py-8 text-red-400">Access denied. Admin only.</div>;
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="pt-20">
        <section className="py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  <span className="gradient-text">Payment Methods</span>
                </h1>
                <p className="text-gray-400">Manage UPI and Crypto BEP-20 payment options</p>
              </div>
              
              <Button
                onClick={() => setIsAddingNew(true)}
                className="neo-button"
              >
                <Plus className="mr-2" size={16} />
                Add Payment Method
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <div className="grid gap-6">
                {/* Add New Method */}
                {isAddingNew && (
                  <Card className="glass-card border-border/20">
                    <CardHeader>
                      <CardTitle className="gradient-text">Add New Payment Method</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-300 mb-2 block">Method Name *</label>
                          <Input
                            value={newMethod.name}
                            onChange={(e) => setNewMethod({ ...newMethod, name: e.target.value })}
                            placeholder="e.g., UPI - PhonePe"
                            className="neon-input bg-gray-900 border-gray-600 text-white"
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm text-gray-300 mb-2 block">Type *</label>
                          <select
                            value={newMethod.type}
                            onChange={(e) => setNewMethod({ ...newMethod, type: e.target.value })}
                            className="w-full p-2 rounded-lg bg-gray-900 border border-gray-600 text-white"
                          >
                            <option value="upi">UPI</option>
                            <option value="crypto">Crypto BEP-20</option>
                          </select>
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="text-sm text-gray-300 mb-2 block">
                            Details * {newMethod.type === 'upi' ? '(UPI ID)' : '(Wallet Address)'}
                          </label>
                          <Input
                            value={newMethod.description}
                            onChange={(e) => setNewMethod({ ...newMethod, description: e.target.value })}
                            placeholder={newMethod.type === 'upi' ? 'user@paytm' : '0x1234...abcd'}
                            className="neon-input bg-gray-900 border-gray-600 text-white"
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="text-sm text-gray-300 mb-2 block">QR Code Image (Optional)</label>
                          <div className="space-y-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (e) => {
                                    setNewMethod({ ...newMethod, qrCodeImage: e.target?.result as string });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="hidden"
                              id="qr-upload"
                            />
                            <label 
                              htmlFor="qr-upload" 
                              className="flex items-center gap-2 p-3 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-purple-500 transition-colors"
                            >
                              <Upload size={20} className="text-gray-400" />
                              <span className="text-gray-400">Click to upload QR code image</span>
                            </label>
                            {newMethod.qrCodeImage && (
                              <div className="mt-2">
                                <img 
                                  src={newMethod.qrCodeImage} 
                                  alt="QR Code Preview" 
                                  className="w-32 h-32 object-contain border border-gray-600 rounded-lg"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button
                          onClick={handleAddMethod}
                          disabled={addMethodMutation.isPending}
                          className="neo-button"
                        >
                          <Save className="mr-2" size={16} />
                          {addMethodMutation.isPending ? "Adding..." : "Add Method"}
                        </Button>
                        <Button
                          onClick={() => setIsAddingNew(false)}
                          variant="outline"
                          className="border-gray-600"
                        >
                          <X className="mr-2" size={16} />
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Existing Methods */}
                {paymentMethods.map((method) => (
                  <Card key={method.id} className="glass-card border-border/20">
                    <CardContent className="p-6">
                      {editingId === method.id && editingMethod ? (
                        // Edit Mode
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm text-gray-300 mb-2 block">Method Name</label>
                              <Input
                                value={editingMethod.name}
                                onChange={(e) => setEditingMethod({ ...editingMethod, name: e.target.value })}
                                className="neon-input bg-gray-900 border-gray-600 text-white"
                              />
                            </div>
                            <div>
                              <label className="text-sm text-gray-300 mb-2 block">Type</label>
                              <select
                                value={editingMethod.type}
                                onChange={(e) => setEditingMethod({ ...editingMethod, type: e.target.value })}
                                className="w-full p-2 rounded-lg bg-gray-900 border border-gray-600 text-white"
                              >
                                <option value="upi">UPI</option>
                                <option value="crypto">Crypto BEP-20</option>
                              </select>
                            </div>
                            <div className="md:col-span-2">
                              <label className="text-sm text-gray-300 mb-2 block">
                                {editingMethod.type === 'upi' ? 'UPI ID' : 'Wallet Address'}
                              </label>
                              <Input
                                value={editingMethod.description}
                                onChange={(e) => setEditingMethod({ ...editingMethod, description: e.target.value })}
                                className="neon-input bg-gray-900 border-gray-600 text-white"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="text-sm text-gray-300 mb-2 block">QR Code Image (Optional)</label>
                              <div className="space-y-2">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = (e) => {
                                        setEditingMethod({ ...editingMethod, qrCodeImage: e.target?.result as string });
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                  className="hidden"
                                  id={`qr-edit-${editingMethod.id}`}
                                />
                                <label 
                                  htmlFor={`qr-edit-${editingMethod.id}`} 
                                  className="flex items-center gap-2 p-3 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-purple-500 transition-colors"
                                >
                                  <Upload size={20} className="text-gray-400" />
                                  <span className="text-gray-400">Click to upload/change QR code image</span>
                                </label>
                                {editingMethod.qrCodeImage && (
                                  <div className="mt-2">
                                    <img 
                                      src={editingMethod.qrCodeImage} 
                                      alt="QR Code Preview" 
                                      className="w-32 h-32 object-contain border border-gray-600 rounded-lg"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                            <div>
                              <label className="text-sm text-gray-300 mb-2 block">Min Amount</label>
                              <Input
                                value={editingMethod.minAmount}
                                onChange={(e) => setEditingMethod({ ...editingMethod, minAmount: e.target.value })}
                                className="neon-input bg-gray-900 border-gray-600 text-white"
                              />
                            </div>
                            <div>
                              <label className="text-sm text-gray-300 mb-2 block">Max Amount</label>
                              <Input
                                value={editingMethod.maxAmount}
                                onChange={(e) => setEditingMethod({ ...editingMethod, maxAmount: e.target.value })}
                                className="neon-input bg-gray-900 border-gray-600 text-white"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={handleSaveEdit} className="neo-button">
                              <Save className="mr-2" size={16} />
                              Save Changes
                            </Button>
                            <Button onClick={handleCancelEdit} variant="outline" className="border-gray-600">
                              <X className="mr-2" size={16} />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            {getMethodIcon(method.type)}
                            <div>
                              <h3 className="text-lg font-bold text-white">{method.name}</h3>
                              <p className="text-sm text-gray-400 capitalize">{method.type}</p>
                              <p className="text-sm text-gray-300 font-mono">
                                {method.type === 'upi' ? method.config?.upi_id : method.config?.wallet_address}
                              </p>
                              {method.qrCodeImage && (
                                <div className="mt-2">
                                  <img 
                                    src={method.qrCodeImage} 
                                    alt="QR Code" 
                                    className="w-16 h-16 object-contain border border-gray-600 rounded"
                                  />
                                </div>
                              )}
                              <p className="text-xs text-gray-500">
                                ₹{method.minAmount} - ₹{method.maxAmount}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <div className={`px-2 py-1 rounded text-xs ${
                              method.isActive 
                                ? 'bg-green-900/30 text-green-400 border border-green-500/30' 
                                : 'bg-red-900/30 text-red-400 border border-red-500/30'
                            }`}>
                              {method.isActive ? 'Active' : 'Inactive'}
                            </div>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditMethod(method)}
                              className="border-blue-500/30 text-blue-400"
                            >
                              <Edit size={14} />
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteMethodMutation.mutate(method.id)}
                              className="border-red-500/30 text-red-400"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {(paymentMethods as PaymentMethod[]).length === 0 && !isAddingNew && (
                  <Card className="glass-card border-border/20">
                    <CardContent className="text-center py-12">
                      <CreditCard className="mx-auto text-gray-500 mb-4" size={48} />
                      <h3 className="text-xl font-bold text-gray-400 mb-2">No Payment Methods</h3>
                      <p className="text-gray-500 mb-4">Add UPI or Crypto BEP-20 payment methods for users</p>
                      <Button
                        onClick={() => setIsAddingNew(true)}
                        className="neo-button"
                      >
                        <Plus className="mr-2" size={16} />
                        Add First Method
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}