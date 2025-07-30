import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "wouter";
import { 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Activity,
  MessageSquare,
  Settings,
  TrendingUp,
  Calendar,
  Eye,
  Target,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Image,
  CreditCard
} from "lucide-react";

export default function Admin() {
  const { user } = useAuth();

  const { data: adminStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: !!user?.isAdmin,
  });

  const { data: recentUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users", 1, ""],
    enabled: !!user?.isAdmin,
  });

  const { data: recentOrders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/admin/orders"],
    enabled: !!user?.isAdmin,
  });

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="glass-card border-border/20 p-8 text-center">
          <AlertTriangle className="mx-auto h-16 w-16 text-red-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-400">Admin privileges required</p>
        </Card>
      </div>
    );
  }

  const statsCards = [
    {
      title: "Total Users",
      value: statsLoading ? "..." : (adminStats?.totalUsers || 0).toLocaleString(),
      icon: <Users className="text-blue-400" size={24} />,
      change: "+12%",
      isPositive: true,
      description: "Active platform users"
    },
    {
      title: "Total Orders",
      value: statsLoading ? "..." : (adminStats?.totalOrders || 0).toLocaleString(),
      icon: <ShoppingCart className="text-green-400" size={24} />,
      change: "+23%",
      isPositive: true,
      description: "Orders completed"
    },
    {
      title: "Total Revenue",
      value: statsLoading ? "..." : `₹${(adminStats?.totalRevenue || 0).toLocaleString()}`,
      icon: <DollarSign className="text-purple-400" size={24} />,
      change: "+18%",
      isPositive: true,
      description: "Platform earnings"
    },
    {
      title: "Active Orders",
      value: statsLoading ? "..." : (adminStats?.activeOrders || 0).toLocaleString(),
      icon: <Activity className="text-orange-400" size={24} />,
      change: "-5%",
      isPositive: false,
      description: "Orders in progress"
    },
    {
      title: "Support Tickets",
      value: statsLoading ? "..." : (adminStats?.supportTickets || 0).toLocaleString(),
      icon: <MessageSquare className="text-red-400" size={24} />,
      change: "+3%",
      isPositive: false,
      description: "Open tickets"
    }
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="pt-20">
        {/* Admin Header */}
        <section className="py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">
                <span className="gradient-text">Admin Dashboard</span>
              </h1>
              <p className="text-gray-400">Complete platform management and analytics</p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-4 mb-8">
              <Link href="/admin-users">
                <Button className="neo-button">
                  <Users size={16} className="mr-2" />
                  Manage Users
                </Button>
              </Link>
              <Link href="/admin-service-management">
                <Button className="neo-button">
                  <Settings size={16} className="mr-2" />
                  Quick Service Control
                </Button>
              </Link>
              <Link href="/admin-support">
                <Button className="neo-button">
                  <MessageSquare size={16} className="mr-2" />
                  Support Contacts
                </Button>
              </Link>
              <Button variant="outline" className="glass-card border-gray-600">
                <MessageSquare size={16} className="mr-2" />
                Support Center
              </Button>
              <Link href="/admin/referral-settings">
                <Button variant="outline" className="glass-card border-purple-500/30 text-purple-400">
                  <TrendingUp size={16} className="mr-2" />
                  Referral Settings
                </Button>
              </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
              {statsCards.map((stat, index) => (
                <Card key={index} className="glass-card border-border/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      {stat.icon}
                      <div className={`flex items-center text-sm ${stat.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {stat.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        <span className="ml-1">{stat.change}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-bold mb-1">{stat.value}</p>
                      <p className="text-sm text-gray-400">{stat.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Admin Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Link href="/admin-users">
                <Card className="glass-card border-border/20 hover:border-purple-500/50 transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-lg bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                        <Users className="h-6 w-6 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Users</h3>
                        <p className="text-sm text-gray-400">Manage user accounts</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/admin-payments">
                <Card className="glass-card border-border/20 hover:border-green-500/50 transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-lg bg-green-500/20 group-hover:bg-green-500/30 transition-colors">
                        <CreditCard className="h-6 w-6 text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Payment Approvals</h3>
                        <p className="text-sm text-gray-400">Approve user payments</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/admin-services">
                <Card className="glass-card border-border/20 hover:border-purple-500/50 transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-lg bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                        <Settings className="h-6 w-6 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Services</h3>
                        <p className="text-sm text-gray-400">Manage service offerings</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/admin-provider-services">
                <Card className="glass-card border-border/20 hover:border-blue-500/50 transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-lg bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                        <ShoppingCart className="h-6 w-6 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Provider Services</h3>
                        <p className="text-sm text-gray-400">Sync & customize pricing</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/admin-service-visibility">
                <Card className="glass-card border-border/20 hover:border-purple-500/50 transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-lg bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                        <Eye className="h-6 w-6 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Service Visibility</h3>
                        <p className="text-sm text-gray-400">Control user-visible services</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/admin-service-management">
                <Card className="glass-card border-border/20 hover:border-green-500/50 transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-lg bg-green-500/20 group-hover:bg-green-500/30 transition-colors">
                        <Settings className="h-6 w-6 text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Quick Service Control</h3>
                        <p className="text-sm text-gray-400">Fast service management & balances</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/admin/messages">
                <Card className="glass-card border-border/20 hover:border-orange-500/50 transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-lg bg-orange-500/20 group-hover:bg-orange-500/30 transition-colors">
                        <MessageSquare className="h-6 w-6 text-orange-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Admin Messages</h3>
                        <p className="text-sm text-gray-400">Broadcast announcements to users</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/admin/logo-settings">
                <Card className="glass-card border-border/20 hover:border-yellow-500/50 transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-lg bg-yellow-500/20 group-hover:bg-yellow-500/30 transition-colors">
                        <Image className="h-6 w-6 text-yellow-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Logo Settings</h3>
                        <p className="text-sm text-gray-400">Customize brand logo and text</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Users */}
              <Card className="glass-card border-border/20">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="gradient-text">Recent Users</CardTitle>
                    <Link href="/admin-users">
                      <Button size="sm" variant="outline" className="border-gray-600">
                        <Eye size={14} className="mr-1" />
                        View All
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {usersLoading ? (
                      <div className="text-center py-4">Loading users...</div>
                    ) : recentUsers.slice(0, 5).map((adminUser: any) => (
                      <div key={adminUser.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                              {adminUser.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{adminUser.username}</p>
                            <p className="text-sm text-gray-400">{adminUser.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-green-400">₹{adminUser.walletBalance}</p>
                          <Badge variant={adminUser.isVerified ? "default" : "secondary"} className="text-xs">
                            {adminUser.isVerified ? "Verified" : "Pending"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Orders */}
              <Card className="glass-card border-border/20">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="gradient-text">Recent Orders</CardTitle>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-gray-600"
                      onClick={() => window.location.href = '/admin-orders'}
                    >
                      <Eye size={14} className="mr-1" />
                      View All Orders
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {ordersLoading ? (
                      <div className="text-center py-4">Loading orders...</div>
                    ) : recentOrders.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <ShoppingCart className="mx-auto h-12 w-12 mb-2" />
                        <p>No recent orders</p>
                      </div>
                    ) : (
                      recentOrders.slice(0, 5).map((order: any) => (
                        <div key={order.id} className="bg-dark-card rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-semibold text-sm">Order #{order.id}</p>
                              <p className="text-xs text-gray-400">by {order.username}</p>
                            </div>
                            <Badge 
                              variant={order.status === 'completed' ? 'default' : 
                                      order.status === 'processing' ? 'secondary' : 'outline'}
                              className="text-xs"
                            >
                              {order.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-300">{order.serviceName}</p>
                            <p className="text-sm font-semibold text-green-400">₹{order.totalPrice}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Platform Health */}
              <Card className="glass-card border-border/20">
                <CardHeader>
                  <CardTitle className="gradient-text">Platform Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Server Status</span>
                      <Badge className="bg-green-500 text-white">Online</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Database</span>
                      <Badge className="bg-green-500 text-white">Connected</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Payment Gateway</span>
                      <Badge variant="secondary">Setup Required</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">API Providers</span>
                      <Badge className="bg-green-500 text-white">3 Active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Statistics */}
              <Card className="glass-card border-border/20">
                <CardHeader>
                  <CardTitle className="gradient-text">Today's Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">New Registrations</span>
                      <span className="font-semibold text-blue-400">+12</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Orders Placed</span>
                      <span className="font-semibold text-green-400">+34</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Revenue Generated</span>
                      <span className="font-semibold text-purple-400">₹2,450</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Support Tickets</span>
                      <span className="font-semibold text-orange-400">+3</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}