import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { X, ShoppingCart, DollarSign, Link as LinkIcon, RefreshCw } from "lucide-react";

interface OrderFormProps {
  service: any;
  onClose: () => void;
}

export function OrderForm({ service, onClose }: OrderFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState("");
  const [targetUrl, setTargetUrl] = useState("");

  const totalPrice = quantity ? (parseFloat(service?.pricePerThousand || "0") * parseInt(quantity) / 1000).toFixed(2) : "0.00";

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest("POST", "/api/orders", orderData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Order Successfully Placed! ✅",
        description: `Order #${data.order?.id || 'N/A'} placed successfully. Start time: 0-6 hours`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      
      // Reset form
      setQuantity("");
      setTargetUrl("");
      onClose();
    },
    onError: (error: any) => {
      let errorMessage = "Failed to place order. Please try again.";
      
      if (error?.message) {
        // Convert common errors to Hindi/English mix
        if (error.message.includes("Insufficient")) {
          errorMessage = "Wallet में balance कम है - Recharge करें 💰";
        } else if (error.message.includes("Invalid") || error.message.includes("Validation")) {
          errorMessage = "गलत जानकारी - Details check करें ✏️";
        } else if (error.message.includes("Service not found")) {
          errorMessage = "Service temporarily unavailable 🔧";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Order Failed ❌",
        description: errorMessage,
        variant: "destructive",
      });
      
      console.error("Order placement error:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!quantity || !targetUrl) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const qty = parseInt(quantity);
    if (qty < service?.minQuantity || qty > service?.maxQuantity) {
      toast({
        title: "Invalid Quantity",
        description: `Quantity must be between ${service?.minQuantity} and ${service?.maxQuantity}`,
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(totalPrice) > parseFloat(user?.walletBalance || "0")) {
      toast({
        title: "Insufficient Balance",
        description: "Please add funds to your wallet first",
        variant: "destructive",
      });
      return;
    }

    createOrderMutation.mutate({
      serviceId: service?.id,
      quantity: qty,
      targetUrl,
      totalPrice,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="glass-card border-border/20 w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="gradient-text">Place Order</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={20} />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Service Info */}
            <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
              <h4 className="service-name mb-1">{service?.name}</h4>
              <p className="text-sm text-gray-400">{service?.description}</p>
              <p className="text-sm text-purple-300 mt-1">
                Rate: ₹{parseFloat(service?.pricePerThousand || "0").toFixed(2)} per 1000
              </p>
            </div>

            {/* Target URL */}
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Target URL *</label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="url"
                  placeholder="https://instagram.com/username"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  className="neon-input bg-dark-card border-gray-600 text-white pl-10"
                  required
                />
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Quantity *</label>
              <Input
                type="number"
                placeholder={`Min: ${service?.minQuantity}, Max: ${service?.maxQuantity}`}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="neon-input bg-dark-card border-gray-600 text-white"
                min={service?.minQuantity}
                max={service?.maxQuantity}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Range: {service?.minQuantity} - {service?.maxQuantity}
              </p>
            </div>

            {/* Price Calculation */}
            <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Total Price:</span>
                <span className="text-lg font-bold text-green-400">₹{totalPrice}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-400 mt-1">
                <span>Your Balance:</span>
                <span>₹{parseFloat(user?.walletBalance || "0").toFixed(2)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={createOrderMutation.isPending || !quantity || !targetUrl}
              className="w-full neo-button relative overflow-hidden disabled:cursor-not-allowed"
            >
              {createOrderMutation.isPending ? (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600/30 to-blue-600/30 animate-pulse"></div>
                  <RefreshCw className="mr-2 animate-spin z-10" size={16} />
                  <span className="font-semibold z-10">Order Place Ho Raha Hai...</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2" size={16} />
                  <span className="font-semibold">Place Order - ₹{totalPrice}</span>
                </>
              )}
            </Button>
            
            {createOrderMutation.isPending && (
              <div className="mt-3 space-y-2">
                <div className="text-center">
                  <p className="text-xs text-yellow-400 animate-pulse font-medium">
                    ⚠️ कृपया wait करें - दोबारा click न करें
                  </p>
                </div>
                <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <span className="ml-2">Processing order...</span>
                </div>
              </div>
            )}

            <p className="text-xs text-gray-500 text-center">
              Your order will start within 0-6 hours
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}