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
import { AdminCancelDialog } from "@/components/admin-cancel-dialog";
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
  User,
  Eye,
  Edit,
  Trash2,
  AlertTriangle
} from "lucide-react";

export default function AdminOrders() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [cancellingOrder, setCancellingOrder] = useState<number | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedOrderForCancel, setSelectedOrderForCancel] = useState<any>(null);

  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/admin/orders"],
    enabled: !!user?.isAdmin,
  });

  // Type the orders array properly
  const typedOrders = orders as any[];

  const handleCancelOrder = (order: any) => {
    setSelectedOrderForCancel(order);
    setCancelDialogOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Clock className="text-yellow-400" size={16} />;
      case 'processing': return <RefreshCw className="text-blue-400 animate-spin" size={16} />;
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
      order.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.targetUrl?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const statusCounts = typedOrders.reduce((acc: any, order: any) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  if (!user?.isAdmin) {
    return <div>Access denied</div>;
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
                  <span className="gradient-text">Admin Orders Management</span>
                </h1>
                <p className="text-gray-400">Monitor and manage all customer orders</p>
              </div>
              <Button onClick={() => refetch()} variant="outline" className="border-purple-500/30">
                <RefreshCw size={16} className="mr-2" />
                Refresh
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
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
                      <p className="text-sm text-gray-400">Pending</p>
                      <p className="text-2xl font-bold text-yellow-400">{statusCounts.pending || 0}</p>
                    </div>
                    <Clock className="text-yellow-400" size={24} />
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
                      <p className="text-sm text-gray-400">Cancelled</p>
                      <p className="text-2xl font-bold text-red-400">{statusCounts.cancelled || 0}</p>
                    </div>
                    <XCircle className="text-red-400" size={24} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Search by user, service, URL or order ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800/50 border-gray-600"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter size={20} className="text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="partial">Partial</option>
                </select>
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
                <p className="text-sm text-gray-500">Try adjusting your filters</p>
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
                            
                            {/* User Information */}
                            <div className="flex items-center space-x-2 bg-purple-900/20 px-3 py-1 rounded-lg">
                              <User size={14} className="text-purple-400" />
                              <span className="text-sm text-purple-300">{order.username}</span>
                            </div>

                            {/* Provider Status */}
                            {order.isSentToProvider && (
                              <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                                Sent to Provider
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 mb-2">
                            {order.serviceName || 'Service Name'}
                          </p>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Calendar size={14} />
                            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{new Date(order.createdAt).toLocaleTimeString()}</span>
                            {order.providerOrderId && (
                              <>
                                <span>•</span>
                                <span className="text-blue-400">Provider ID: {order.providerOrderId}</span>
                              </>
                            )}
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
                          <p className="text-sm text-gray-400 mb-1">Progress Data</p>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="bg-gray-800/50 p-2 rounded">
                              <div className="text-gray-400">Start</div>
                              <div className="font-semibold">{order.startCount || 0}</div>
                            </div>
                            <div className="bg-gray-800/50 p-2 rounded">
                              <div className="text-gray-400">Delivered</div>
                              <div className="font-semibold text-green-400">{order.deliveredCount || 0}</div>
                            </div>
                            <div className="bg-gray-800/50 p-2 rounded">
                              <div className="text-gray-400">Remaining</div>
                              <div className="font-semibold text-orange-400">{order.remains || order.quantity}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Admin Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-800 mt-4">
                        <div className="flex items-center space-x-2">
                          {/* Cancel Button for admin */}
                          {(order.status === 'pending' || order.status === 'processing') && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancelOrder(order)}
                              className="border-red-500/30 text-red-400 hover:bg-red-900/20"
                            >
                              <XCircle size={12} className="mr-1" />
                              Cancel with Reason
                            </Button>
                          )}
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          User ID: {order.userId} | Service ID: {order.serviceId}
                        </div>
                      </div>

                      {/* Status Messages */}
                      {order.status === 'processing' && (
                        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <RefreshCw size={16} className="text-blue-400 animate-spin" />
                            <span className="text-sm text-blue-300">
                              Order is being processed by provider. Expected completion: 24-48 hours
                            </span>
                          </div>
                        </div>
                      )}

                      {order.status === 'completed' && (
                        <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <CheckCircle size={16} className="text-green-400" />
                            <span className="text-sm text-green-300">
                              Order completed successfully! Service delivered to user.
                            </span>
                          </div>
                        </div>
                      )}

                      {order.status === 'cancelled' && (
                        <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <XCircle size={16} className="text-red-400" />
                            <span className="text-sm text-red-300">
                              Order was cancelled and refund has been processed.
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

      {/* Cancel Dialog */}
      {selectedOrderForCancel && (
        <AdminCancelDialog
          isOpen={cancelDialogOpen}
          onClose={() => {
            setCancelDialogOpen(false);
            setSelectedOrderForCancel(null);
          }}
          orderId={selectedOrderForCancel.id}
          orderDetails={`${selectedOrderForCancel.serviceName} - ${selectedOrderForCancel.quantity} items for ${selectedOrderForCancel.username}`}
        />
      )}
    </div>
  );
}