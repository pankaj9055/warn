import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Package,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  Link as LinkIcon,
  ArrowUpRight,
  BarChart3,
  TrendingUp,
  Eye,
  Users,
  Heart,
  Play
} from "lucide-react";

export default function MyOrders() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [cancellingOrder, setCancellingOrder] = useState<number | null>(null);

  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/orders"],
    enabled: !!user,
  });

  // Type the orders array properly
  const typedOrders = orders as any[];

  const syncOrderMutation = useMutation({
    mutationFn: async (orderId: number) => {
      const response = await apiRequest("POST", `/api/orders/${orderId}/sync`);
      return response.json();
    },
    onSuccess: () => {
      toast({ 
        title: "Order Status Updated", 
        description: "Order status has been synced with provider",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Sync Failed", 
        description: error.message || "Failed to sync order status",
        variant: "destructive"
      });
    },
  });

  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: number) => {
      const response = await apiRequest("POST", `/api/orders/${orderId}/cancel`);
      return response.json();
    },
    onSuccess: () => {
      toast({ 
        title: "Order Cancelled", 
        description: "Your order has been cancelled and refund added to wallet",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] }); // Refresh wallet balance
      setCancellingOrder(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Cancellation Failed", 
        description: error.message || "Failed to cancel order",
        variant: "destructive"
      });
      setCancellingOrder(null);
    },
  });

  const handleCancelOrder = (orderId: number) => {
    setCancellingOrder(orderId);
    cancelOrderMutation.mutate(orderId);
  };

  const handleSyncOrder = (orderId: number) => {
    syncOrderMutation.mutate(orderId);
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Clock className="text-yellow-400" size={16} />;
      case 'processing': return <RefreshCw className="text-blue-400" size={16} />;
      case 'completed': return <CheckCircle className="text-green-400" size={16} />;
      case 'cancelled': return <XCircle className="text-red-400" size={16} />;
      case 'partial': return <Package className="text-orange-400" size={16} />;
      default: return <Clock className="text-gray-400" size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-900/30 border-yellow-500/30 text-yellow-400';
      case 'processing': return 'bg-blue-900/30 border-blue-500/30 text-blue-400';
      case 'completed': return 'bg-green-900/30 border-green-500/30 text-green-400';
      case 'cancelled': return 'bg-red-900/30 border-red-500/30 text-red-400';
      case 'partial': return 'bg-orange-900/30 border-orange-500/30 text-orange-400';
      default: return 'bg-gray-900/30 border-gray-500/30 text-gray-400';
    }
  };

  const filteredOrders = typedOrders.filter((order: any) => {
    const matchesStatus = !statusFilter || order.status === statusFilter;
    const matchesSearch = !searchTerm || 
      order.service?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.targetUrl.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusCounts = typedOrders.reduce((acc: any, order: any) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  if (!user) {
    return <div>Please login to view orders</div>;
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="pt-20">
        {/* Header Section */}
        <section className="py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  <span className="gradient-text">My Orders</span>
                </h1>
                <p className="text-gray-400">Track and manage your service orders</p>
              </div>
              <Button onClick={() => refetch()} variant="outline" className="border-purple-500/30">
                <RefreshCw size={16} className="mr-2" />
                Refresh
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card className="glass-card border-border/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Orders</p>
                      <p className="text-2xl font-bold text-white">{typedOrders.length}</p>
                    </div>
                    <Package className="text-purple-400" size={24} />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-card border-border/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Completed</p>
                      <p className="text-2xl font-bold text-green-400">{statusCounts.completed || 0}</p>
                    </div>
                    <CheckCircle className="text-green-400" size={24} />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-card border-border/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Processing</p>
                      <p className="text-2xl font-bold text-blue-400">{statusCounts.processing || 0}</p>
                    </div>
                    <RefreshCw className="text-blue-400" size={24} />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-card border-border/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Pending</p>
                      <p className="text-2xl font-bold text-yellow-400">{statusCounts.pending || 0}</p>
                    </div>
                    <Clock className="text-yellow-400" size={24} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="neon-input bg-dark-card border-gray-600 text-white placeholder-gray-500 pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === "" ? "default" : "outline"}
                  onClick={() => setStatusFilter("")}
                  className="border-gray-600"
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === "pending" ? "default" : "outline"}
                  onClick={() => setStatusFilter("pending")}
                  className="border-yellow-500/30 text-yellow-400"
                >
                  Pending
                </Button>
                <Button
                  variant={statusFilter === "processing" ? "default" : "outline"}
                  onClick={() => setStatusFilter("processing")}
                  className="border-blue-500/30 text-blue-400"
                >
                  Processing
                </Button>
                <Button
                  variant={statusFilter === "completed" ? "default" : "outline"}
                  onClick={() => setStatusFilter("completed")}
                  className="border-green-500/30 text-green-400"
                >
                  Completed
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Orders List */}
        <section className="py-8 px-4">
          <div className="max-w-7xl mx-auto">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto text-gray-500 mb-3" size={48} />
                <p className="text-gray-400 mb-2">No orders found</p>
                <p className="text-sm text-gray-500">Start ordering services to see them here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order: any) => (
                  <Card key={order.id} className="glass-card border-border/20">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-bold text-white">
                              Order #{order.id}
                            </h3>
                            <Badge className={getStatusColor(order.status)}>
                              <span className="flex items-center space-x-1">
                                {getStatusIcon(order.status)}
                                <span className="capitalize">{order.status}</span>
                              </span>
                            </Badge>
                            {/* Action Buttons */}
                            <div className="flex gap-2 ml-2">
                              {/* Sync Button for pending/processing orders */}
                              {(order.status === 'pending' || order.status === 'processing') && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSyncOrder(order.id)}
                                  disabled={syncOrderMutation.isPending}
                                  className="border-blue-500/30 text-blue-400 hover:bg-blue-900/20"
                                  title="Sync status with provider"
                                >
                                  {syncOrderMutation.isPending ? (
                                    <RefreshCw size={12} className="animate-spin mr-1" />
                                  ) : (
                                    <RefreshCw size={12} className="mr-1" />
                                  )}
                                  Sync
                                </Button>
                              )}
                              
                              {/* Cancel Button - only for orders NOT sent to provider */}
                              {order.status === 'pending' && !order.isSentToProvider && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCancelOrder(order.id)}
                                  disabled={cancellingOrder === order.id}
                                  className="border-red-500/30 text-red-400 hover:bg-red-900/20"
                                >
                                  {cancellingOrder === order.id ? (
                                    <RefreshCw size={12} className="animate-spin mr-1" />
                                  ) : (
                                    <XCircle size={12} className="mr-1" />
                                  )}
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </div>
                          <div className="mb-2">
                            <p className="text-sm font-semibold text-white mb-1 line-clamp-2">
                              {order.service?.name || order.serviceName || 'Service Name'}
                            </p>
                            <p className="text-xs text-gray-400 line-clamp-2">
                              {order.service?.description || 'High quality social media service delivery'}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Calendar size={14} />
                            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{new Date(order.createdAt).toLocaleTimeString()}</span>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-400 mb-1">
                            ₹{parseFloat(order.totalPrice).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-400">
                            Qty: {order.quantity}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-800">
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Target URL</p>
                          <div className="flex items-center space-x-2">
                            <LinkIcon size={14} className="text-gray-500" />
                            <a 
                              href={order.targetUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-400 hover:text-blue-300 truncate"
                            >
                              {order.targetUrl}
                            </a>
                            <ArrowUpRight size={12} className="text-gray-500" />
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Progress Tracking</p>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="bg-gray-800/50 p-2 rounded">
                              <div className="text-gray-400">Start Count</div>
                              <div className="font-semibold">{order.startCount || 0}</div>
                            </div>
                            <div className="bg-gray-800/50 p-2 rounded">
                              <div className="text-gray-400">Delivered</div>
                              <div className="font-semibold text-green-400">{order.deliveredCount || 0}</div>
                            </div>
                            <div className="bg-gray-800/50 p-2 rounded">
                              <div className="text-gray-400">Remaining</div>
                              <div className="font-semibold text-orange-400">{order.remains || order.quantity || 0}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {order.status === 'processing' && (
                        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <RefreshCw size={16} className="text-blue-400 animate-spin" />
                              <span className="text-sm text-blue-300">
                                Your order is being processed. Expected completion: 24-48 hours
                              </span>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSyncOrder(order.id)}
                              disabled={syncOrderMutation.isPending}
                              className="border-blue-500/30 text-blue-400 hover:bg-blue-900/20"
                            >
                              Check Status
                            </Button>
                          </div>
                        </div>
                      )}

                      {order.status === 'completed' && (
                        <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <CheckCircle size={16} className="text-green-400" />
                            <span className="text-sm text-green-300">
                              Order completed successfully! Service has been delivered.
                            </span>
                          </div>
                        </div>
                      )}

                      {order.status === 'cancelled' && (
                        <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <XCircle size={16} className="text-red-400" />
                            <span className="text-sm text-red-300">
                              Order was cancelled and refund has been added to your wallet.
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}