import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/navigation";
import { StatsCard } from "@/components/ui/stats-card";
import { UserMessagingImproved } from "@/components/user-messaging-improved";
import { TransactionHistory } from "@/components/transaction-history";

import { LoadingSpinner } from "@/components/ui/loading-spinner";
import AdminMessageImproved from "@/components/admin-message-improved";
import { UserPasswordChange } from "@/components/user-password-change";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import WelcomeBanner from "@/components/welcome-banner";
import { 
  ShoppingCart, 
  CheckCircle, 
  Clock, 
  Wallet, 
  Plus, 
  Headphones, 
  Key,
  Copy,
  Users,
  TrendingUp,
  MessageCircle
} from "lucide-react";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  const { data: stats = {}, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    enabled: !!user,
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders"],
    enabled: !!user,
  });

  const { data: referrals = [], isLoading: referralsLoading } = useQuery({
    queryKey: ["/api/referrals"],
    enabled: !!user,
  });

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}/register?ref=${user.referralCode}`;
    navigator.clipboard.writeText(referralLink);
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="pt-20">
        {/* Important Notice */}
        <section className="py-4 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="notice-banner bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-500/30 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-yellow-500/20 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-yellow-300 mb-1">⚠️ Service Order Notice</h3>
                  <p className="text-xs text-yellow-200/90">
                    <strong>एक समय में एक ही service का order करें!</strong> अगर आपने Views का order लगाया है तो Followers या Likes choose करें। Same service दोबारा नहीं लगा सकते।
                  </p>
                </div>
                <button 
                  onClick={(e) => e.currentTarget.closest('.notice-banner')?.remove()}
                  className="text-yellow-400 hover:text-yellow-300 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Welcome Section */}
        <section className="py-8 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Jammu Kashmir Welcome Banner */}
            <div className="mb-8">
              <WelcomeBanner user={user} showLoginMessage={true} />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="Total Orders"
                value={statsLoading ? "..." : (stats as any)?.totalOrders || 0}
                icon={<ShoppingCart className="text-white" size={20} />}
                trend={{ value: "+12% this month", isPositive: true }}
              />
              
              <StatsCard
                title="Completed"
                value={statsLoading ? "..." : (stats as any)?.completedOrders || 0}
                icon={<CheckCircle className="text-white" size={20} />}
                subtitle="91% success rate"
              />
              
              <StatsCard
                title="Pending"
                value={statsLoading ? "..." : (stats as any)?.pendingOrders || 0}
                icon={<Clock className="text-white" size={20} />}
                subtitle="Processing..."
              />
              
              <StatsCard
                title="Wallet Balance"
                value={`₹${user.walletBalance}`}
                icon={<Wallet className="text-white" size={20} />}
              />
            </div>

            {/* Admin Messages */}
            <div className="mb-8">
              <AdminMessageImproved />
            </div>

            {/* Messages with Admin Card - Single Card as per Screenshot */}
            <div className="mb-8">
              <Card 
                className="glass-card border-border/20 cursor-pointer hover:border-purple-500/50 transition-all duration-300 max-w-md mx-auto"
                onClick={() => setLocation("/messages-with-admin")}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                      <MessageCircle className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">Messages with Admin</h3>
                      <p className="text-gray-400 text-sm">Chat directly with admin support</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Quick Actions */}
              <Card className="glass-card border-border/20">
                <CardHeader>
                  <CardTitle className="gradient-text">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      onClick={() => setLocation("/services")}
                      className="neo-button p-4 rounded-xl text-white font-medium h-auto flex flex-col items-center space-y-2"
                    >
                      <ShoppingCart size={24} />
                      <span>Browse Services</span>
                    </Button>
                    <Button
                      onClick={() => setLocation("/wallet")}
                      className="neo-button p-4 rounded-xl text-white font-medium h-auto flex flex-col items-center space-y-2"
                    >
                      <Plus size={24} />
                      <span>Add Funds</span>
                    </Button>
                    <Button
                      onClick={() => setLocation("/my-orders")}
                      className="neo-button p-4 rounded-xl text-white font-medium h-auto flex flex-col items-center space-y-2"
                    >
                      <Clock size={24} />
                      <span>My Orders</span>
                    </Button>
                    <Button
                      onClick={() => setLocation("/referrals")}
                      className="neo-button p-4 rounded-xl text-white font-medium h-auto flex flex-col items-center space-y-2"
                    >
                      <Users size={24} />
                      <span>Referrals</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Recent Orders */}
                <Card className="glass-card border-border/20">
                  <CardHeader>
                    <CardTitle className="gradient-text">Recent Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {ordersLoading ? (
                        <div className="flex justify-center py-4">
                          <LoadingSpinner />
                        </div>
                      ) : (orders as any[]).length === 0 ? (
                        <p className="text-gray-400 text-center py-4">No orders yet</p>
                      ) : (
                        (orders as any[]).slice(0, 3).map((order: any) => (
                          <div key={order.id} className="flex items-center justify-between p-3 bg-dark-card rounded-xl">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                <ShoppingCart size={14} />
                              </div>
                              <div>
                                <div className="text-sm font-medium">Order #{order.id}</div>
                                <div className="text-xs text-gray-400">{order.quantity} qty</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                                {order.status}
                              </Badge>
                              <div className="text-xs text-gray-400">₹{order.totalPrice}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Transaction History */}
                <TransactionHistory />

                {/* User Messages */}
                <UserMessagingImproved />

                {/* Referral Program */}
                <Card className="glass-card border-border/20">
                  <CardHeader>
                    <CardTitle className="gradient-text">Referral Program</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-dark-card rounded-xl">
                        <div className="text-2xl font-bold gradient-text mb-1">
                          ₹{user.totalReferralEarnings || "0.00"}
                        </div>
                        <div className="text-sm text-gray-400">Total Earnings</div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm text-gray-300">Your Referral Link:</div>
                        <div className="flex items-center space-x-2">
                          <Input
                            value={`${window.location.origin}/register?ref=${user.referralCode}`}
                            readOnly
                            className="bg-gray-900 border-gray-600 text-sm text-white"
                          />
                          <Button 
                            size="sm"
                            onClick={copyReferralLink}
                            className="p-2 rounded-xl bg-purple-500 hover:bg-purple-600"
                          >
                            <Copy size={14} />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="bg-dark-card rounded-xl p-3">
                          <div className="text-lg font-bold text-green-400">
                            {(referrals as any[]).length || 0}
                          </div>
                          <div className="text-xs text-gray-400">Referrals</div>
                        </div>
                        <div className="bg-dark-card rounded-xl p-3">
                          <div className="text-lg font-bold text-pink-400">
                            {(referrals as any[]).filter((r: any) => r.type === 'signup').length || 0}
                          </div>
                          <div className="text-xs text-gray-400">Active</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* User Password Change */}
                <UserPasswordChange />

                {/* Quick Actions */}
                <Card className="glass-card border-border/20">
                  <CardHeader>
                    <CardTitle className="gradient-text">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button 
                        onClick={() => setLocation("/checkout")}
                        className="w-full neo-button p-3 rounded-xl text-white font-medium"
                      >
                        <Plus className="mr-2" size={16} />
                        Add Funds
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setLocation("/support")}
                        className="w-full glass-card p-3 rounded-xl text-green-400 font-medium border border-green-400/30"
                      >
                        <Headphones className="mr-2" size={16} />
                        Get Support
                      </Button>
                      {user.isAdmin && (
                        <Button 
                          variant="outline"
                          onClick={() => setLocation("/admin-api-settings")}
                          className="w-full glass-card p-3 rounded-xl text-pink-400 font-medium border border-pink-400/30"
                        >
                          <Key className="mr-2" size={16} />
                          API Settings
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
