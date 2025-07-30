import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { X, AlertTriangle } from "lucide-react";

interface AdminCancelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
  orderDetails: string;
}

export function AdminCancelDialog({ isOpen, onClose, orderId, orderDetails }: AdminCancelDialogProps) {
  const [reason, setReason] = useState("");
  const { toast } = useToast();

  const cancelOrderMutation = useMutation({
    mutationFn: async (data: { orderId: number; reason: string }) => {
      const response = await apiRequest("POST", `/api/admin/orders/${data.orderId}/cancel`, { 
        reason: data.reason 
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Order Cancelled",
        description: "Order has been cancelled and user has been notified with reason",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      onClose();
      setReason("");
    },
    onError: (error: any) => {
      toast({
        title: "Cancellation Failed",
        description: error.message || "Failed to cancel order",
        variant: "destructive",
      });
    },
  });

  const handleCancel = () => {
    if (!reason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for cancellation",
        variant: "destructive",
      });
      return;
    }

    cancelOrderMutation.mutate({ orderId, reason: reason.trim() });
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass-card border-border/20 max-w-md mx-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold gradient-text flex items-center">
              <AlertTriangle className="mr-2 text-red-400" size={24} />
              Cancel Order
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-gray-400 hover:text-white"
            >
              <X size={16} />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Order Details */}
          <div className="p-3 bg-gray-800/50 border border-gray-600/30 rounded-lg">
            <h4 className="font-semibold text-white mb-1">Order Details:</h4>
            <p className="text-sm text-gray-400">{orderDetails}</p>
          </div>

          {/* Cancellation Reason */}
          <div>
            <Label htmlFor="cancel-reason" className="text-sm font-medium text-white">
              Cancellation Reason *
            </Label>
            <Textarea
              id="cancel-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a clear reason for cancelling this order..."
              rows={4}
              className="neon-input bg-dark-card border-gray-600 text-white mt-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              This reason will be shown to the user along with their refund
            </p>
          </div>

          {/* Warning */}
          <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="text-red-400 mt-0.5" size={16} />
              <div className="text-sm text-red-300">
                <p className="font-semibold mb-1">Warning:</p>
                <p>This will cancel the order, refund the user's wallet, and notify them with your reason.</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 border-gray-500/30"
              disabled={cancelOrderMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCancel}
              disabled={cancelOrderMutation.isPending || !reason.trim()}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {cancelOrderMutation.isPending ? "Cancelling..." : "Cancel Order"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}