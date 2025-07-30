import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  Package,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  Calendar,
  Link as LinkIcon,
  ArrowUpRight,
  BarChart3,
  TrendingUp,
  Eye,
  Users,
  Heart,
  Play,
  Target,
  Activity
} from "lucide-react";
import { format } from "date-fns";

export default function MyOrdersEnhanced() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/orders"],
    enabled: !!user,
  });

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

  const getServiceIcon = (serviceName: string) => {
    const name = serviceName.toLowerCase();
    if (name.includes('view') || name.includes('watch')) return <Eye className="text-blue-400" size={16} />;
    if (name.includes('follower') || name.includes('subscriber')) return <Users className="text-green-400" size={16} />;
    if (name.includes('like') || name.includes('heart')) return <Heart className="text-red-400" size={16} />;
    if (name.includes('play')) return <Play className="text-purple-400" size={16} />;
    return <Activity className="text-gray-400" size={16} />;
  };

  const filteredOrders = orders.filter((order: any) => {
    const matchesStatus = !statusFilter || order.status === statusFilter;
    const matchesSearch = !searchTerm || 
      order.service?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.targetUrl.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusCounts = orders.reduce((acc: any, order: any) => {
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
                <p className="text-gray-400">Track progress and completion details</p>
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
                      <p className="text-2xl font-bold text-white">{orders.length}</p>
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
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    placeholder="Search orders by service name or URL..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="neon-input pl-10 bg-dark-card border-gray-600"
                  />
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant={statusFilter === "" ? "default" : "outline"}
                  onClick={() => setStatusFilter("")}
                  className="border-purple-500/30"
                >
                  All Orders
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
                <Package className="mx-auto text-gray-500 mb-4" size={64} />
                <h3 className="text-xl font-bold text-gray-400 mb-2">No orders found</h3>
                <p className="text-gray-500">
                  {statusFilter || searchTerm 
                    ? "Try adjusting your filters" 
                    : "Place your first order to get started"
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredOrders.map((order: any) => {
                  const currentCount = order.startCount || 0;
                  const delivered = order.quantity - (order.remains || order.quantity);
                  const progress = order.quantity > 0 ? (delivered / order.quantity) * 100 : 0;
                  const finalCount = currentCount + delivered;
                  
                  return (
                    <Card key={order.id} className="glass-card border-border/20 overflow-hidden">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="flex items-center space-x-2">
                                {getServiceIcon(order.service?.name || '')}
                                <h3 className="text-xl font-bold text-white">
                                  Order #{order.id}
                                </h3>
                              </div>
                              <Badge className={getStatusColor(order.status)}>
                                <span className="flex items-center space-x-1">
                                  {getStatusIcon(order.status)}
                                  <span className="capitalize">{order.status}</span>
                                </span>
                              </Badge>
                            </div>
                            <p className="text-lg text-gray-300 mb-2 font-medium">
                              {order.service?.name || 'Service Name'}
                            </p>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <Calendar size={14} />
                              <span>{format(new Date(order.createdAt), "MMM dd, yyyy")}</span>
                              <span>•</span>
                              <span>{format(new Date(order.createdAt), "HH:mm")}</span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-400 mb-1">
                              ₹{parseFloat(order.totalPrice).toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-400">
                              Quantity: {order.quantity.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0">
                        {/* Target URL */}
                        <div className="mb-6 p-4 bg-gray-800/30 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <Target size={16} className="text-blue-400" />
                            <p className="text-sm font-medium text-gray-300">Target Link</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <LinkIcon size={14} className="text-gray-500" />
                            <a 
                              href={order.targetUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 truncate flex-1"
                            >
                              {order.targetUrl}
                            </a>
                            <ArrowUpRight size={12} className="text-gray-500" />
                          </div>
                        </div>

                        {/* Progress and Stats */}
                        {(order.status === 'processing' || order.status === 'completed' || order.status === 'partial') && (
                          <div className="space-y-4 mb-6">
                            {/* Progress Bar */}
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-300">Delivery Progress</span>
                                <span className="text-sm text-gray-400">{Math.round(progress)}%</span>
                              </div>
                              <Progress 
                                value={progress} 
                                className="h-3 bg-gray-800"
                              />
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="text-center p-3 bg-blue-900/20 rounded-lg border border-blue-500/20">
                                <p className="text-xs text-blue-400 mb-1">Start Count</p>
                                <p className="text-lg font-bold text-white">{currentCount.toLocaleString()}</p>
                              </div>
                              
                              <div className="text-center p-3 bg-green-900/20 rounded-lg border border-green-500/20">
                                <p className="text-xs text-green-400 mb-1">Delivered</p>
                                <p className="text-lg font-bold text-white">{delivered.toLocaleString()}</p>
                              </div>
                              
                              <div className="text-center p-3 bg-purple-900/20 rounded-lg border border-purple-500/20">
                                <p className="text-xs text-purple-400 mb-1">Current Count</p>
                                <p className="text-lg font-bold text-white">{finalCount.toLocaleString()}</p>
                              </div>
                              
                              <div className="text-center p-3 bg-orange-900/20 rounded-lg border border-orange-500/20">
                                <p className="text-xs text-orange-400 mb-1">Remaining</p>
                                <p className="text-lg font-bold text-white">{(order.remains || 0).toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Status Messages */}
                        {order.status === 'pending' && (
                          <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <Clock size={16} className="text-yellow-400" />
                              <span className="text-sm text-yellow-300">
                                Order submitted and waiting to be processed. Usually starts within 1-2 hours.
                              </span>
                            </div>
                          </div>
                        )}

                        {order.status === 'processing' && (
                          <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <RefreshCw size={16} className="text-blue-400 animate-spin" />
                              <span className="text-sm text-blue-300">
                                Service is being delivered. Progress is updated every few hours.
                              </span>
                            </div>
                          </div>
                        )}

                        {order.status === 'completed' && (
                          <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <CheckCircle size={16} className="text-green-400" />
                              <span className="text-sm text-green-300">
                                Order completed successfully! {delivered.toLocaleString()} delivered to your link.
                              </span>
                            </div>
                            {order.completedAt && (
                              <p className="text-xs text-gray-400 mt-1">
                                Completed on {format(new Date(order.completedAt), "MMM dd, yyyy 'at' HH:mm")}
                              </p>
                            )}
                          </div>
                        )}

                        {order.status === 'partial' && (
                          <div className="p-4 bg-orange-900/20 border border-orange-500/30 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <Package size={16} className="text-orange-400" />
                              <span className="text-sm text-orange-300">
                                Partial delivery completed. {delivered.toLocaleString()} out of {order.quantity.toLocaleString()} delivered.
                              </span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}