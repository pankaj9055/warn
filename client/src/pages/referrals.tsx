import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { 
  Gift,
  Users,
  Copy,
  Share,
  TrendingUp,
  Banknote,
  UserPlus,
  CheckCircle
} from "lucide-react";

export default function Referrals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const { data: referrals = [], isLoading } = useQuery({
    queryKey: ["/api/referrals"],
    enabled: !!user,
  });

  const referralCode = user?.referralCode || "JKSMM" + user?.id;
  const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareReferralLink = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join JKSMM - Get ₹10 Bonus!',
        text: 'Join JKSMM using my referral code and get ₹10 bonus when you deposit ₹50 or more!',
        url: referralLink,
      });
    } else {
      copyReferralLink();
    }
  };

  const totalEarnings = (referrals as any[]).reduce((sum: number, ref: any) => sum + parseFloat(ref.commissionAmount), 0);
  const activeReferrals = (referrals as any[]).filter((ref: any) => ref.type === 'signup').length;

  if (!user) {
    return <div>Please login to view referrals</div>;
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
                <span className="gradient-text">Referral Program</span>
              </h1>
              <p className="text-gray-400">
                <strong>NEW SYSTEM:</strong> Earn ₹10-₹80 based on deposit amounts (₹100=₹10, ₹200=₹30, ₹500+=₹80)
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="glass-card border-border/20 glow-on-hover">
                <CardContent className="text-center p-6">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                    <Banknote className="text-white" size={20} />
                  </div>
                  <p className="text-sm text-gray-400 mb-1">Total Earnings</p>
                  <p className="text-2xl font-bold text-green-400">₹{totalEarnings.toFixed(2)}</p>
                </CardContent>
              </Card>

              <Card className="glass-card border-border/20 glow-on-hover">
                <CardContent className="text-center p-6">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <Users className="text-white" size={20} />
                  </div>
                  <p className="text-sm text-gray-400 mb-1">Active Referrals</p>
                  <p className="text-2xl font-bold text-blue-400">{activeReferrals}</p>
                </CardContent>
              </Card>

              <Card className="glass-card border-border/20 glow-on-hover">
                <CardContent className="text-center p-6">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <TrendingUp className="text-white" size={20} />
                  </div>
                  <p className="text-sm text-gray-400 mb-1">Commission Rate</p>
                  <p className="text-2xl font-bold gradient-text">₹10-₹80</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <Card className="glass-card border-border/20 mb-8">
              <CardHeader>
                <CardTitle className="gradient-text text-center">
                  <Gift className="inline mr-2" size={24} />
                  How Referrals Work
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Share className="text-white" size={24} />
                    </div>
                    <h3 className="font-bold text-white mb-2">1. Share Your Link</h3>
                    <p className="text-sm text-gray-400">Share your unique referral link with friends</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <UserPlus className="text-white" size={24} />
                    </div>
                    <h3 className="font-bold text-white mb-2">2. Friends Join</h3>
                    <p className="text-sm text-gray-400">They sign up using your referral code</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-yellow-500 flex items-center justify-center">
                      <Banknote className="text-white" size={24} />
                    </div>
                    <h3 className="font-bold text-white mb-2">3. Earn Rewards</h3>
                    <p className="text-sm text-gray-400">Get ₹10-₹80 based on their deposit amount</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Referral Link */}
        <section className="py-8 px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="glass-card border-border/20 mb-8">
              <CardHeader>
                <CardTitle className="gradient-text">Your Referral Link</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-300 mb-2 block">Referral Code</label>
                    <div className="flex gap-2">
                      <Input
                        value={referralCode}
                        readOnly
                        className="neon-input bg-gray-900 border-gray-600 text-white font-mono"
                      />
                      <Button onClick={copyReferralLink} variant="outline" className="border-purple-500/30">
                        {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-300 mb-2 block">Referral Link</label>
                    <div className="flex gap-2">
                      <Input
                        value={referralLink}
                        readOnly
                        className="neon-input bg-gray-900 border-gray-600 text-white font-mono text-sm"
                      />
                      <Button onClick={copyReferralLink} variant="outline" className="border-purple-500/30">
                        {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={copyReferralLink} className="flex-1 neo-button">
                      <Copy className="mr-2" size={16} />
                      Copy Link
                    </Button>
                    <Button onClick={shareReferralLink} className="flex-1 neo-button">
                      <Share className="mr-2" size={16} />
                      Share Link
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Referral History */}
        <section className="py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <Card className="glass-card border-border/20">
              <CardHeader>
                <CardTitle className="gradient-text">Referral History</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : (referrals as any[]).length === 0 ? (
                  <div className="text-center py-8">
                    <Gift className="mx-auto text-gray-500 mb-4" size={48} />
                    <p className="text-gray-400 mb-4">No referrals yet</p>
                    <div className="bg-gray-800 p-6 rounded-lg text-left max-w-md mx-auto">
                      <div className="text-green-400 font-bold mb-3">💰 Referral Reward System (Bold):</div>
                      <div className="text-sm text-gray-300 space-y-2">
                        <div><strong className="text-white">When friend deposits ₹100:</strong> <span className="text-green-400 font-bold">You get ₹10</span></div>
                        <div><strong className="text-white">When friend deposits ₹200:</strong> <span className="text-green-400 font-bold">You get ₹30</span></div>
                        <div><strong className="text-white">When friend deposits ₹500+:</strong> <span className="text-green-400 font-bold">You get ₹80</span></div>
                        <div className="text-yellow-400 mt-3 font-bold border-t border-gray-600 pt-3">
                          🎯 Maximum earning: ₹80 per referral on big deposits!
                        </div>
                        <div className="text-purple-400 mt-2 font-bold">
                          📢 Start sharing above link to earn money!
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(referrals as any[]).map((referral: any) => (
                      <div 
                        key={referral.id}
                        className="flex items-center justify-between p-4 bg-dark-card rounded-lg border border-gray-700"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Users className="text-white" size={16} />
                          </div>
                          <div>
                            <p className="font-semibold text-white">
                              Referral Commission
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(referral.createdAt).toLocaleDateString()} • {' '}
                              {new Date(referral.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-semibold text-green-400">
                            +₹{parseFloat(referral.commissionAmount).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-400 capitalize">
                            {referral.type}
                          </p>
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