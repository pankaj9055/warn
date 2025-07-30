import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  Users, 
  TrendingUp, 
  DollarSign,
  Save,
  RefreshCw
} from "lucide-react";

export default function AdminReferralSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings = {}, isLoading } = useQuery({
    queryKey: ["/api/admin/referral-settings"],
    enabled: !!user?.isAdmin,
  });

  const form = useForm({
    defaultValues: {
      commissionRate: settings?.commissionRate || "0.05",
      minDepositAmount: settings?.minDepositAmount || "50.00",
      maxCommissionPerRefer: settings?.maxCommissionPerRefer || "100.00",
      referralWelcomeMessage: settings?.referralWelcomeMessage || "Welcome to JKSMM! You've been referred by a friend.",
      commissionDescription: settings?.commissionDescription || "Earn ₹{amount} for every ₹{deposit}+ deposit from your referrals!",
      termsAndConditions: settings?.termsAndConditions || "• Minimum deposit of ₹50 required for commission\n• Commission is credited instantly\n• Valid for lifetime referrals",
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest("PUT", "/api/admin/referral-settings", data),
    onSuccess: () => {
      toast({ title: "Referral settings updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/referral-settings"] });
    },
    onError: () => {
      toast({ 
        title: "Failed to update settings", 
        variant: "destructive" 
      });
    },
  });

  const handleSubmit = (data: any) => {
    updateSettingsMutation.mutate(data);
  };

  if (!user?.isAdmin) return null;

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="pt-20">
        <section className="py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-3 mb-8">
              <Settings className="h-8 w-8 text-purple-400" />
              <div>
                <h1 className="text-3xl font-bold gradient-text">Referral System Settings</h1>
                <p className="text-gray-400">Control referral commissions and messaging</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Settings Form */}
              <div className="lg:col-span-2">
                <Card className="glass-card border-border/20">
                  <CardHeader>
                    <CardTitle className="gradient-text flex items-center space-x-2">
                      <DollarSign className="h-5 w-5" />
                      <span>Commission Settings</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        {/* Commission Rate */}
                        <FormField
                          name="commissionRate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Commission Amount (₹)</FormLabel>
                              <FormDescription>
                                Amount earned per qualifying deposit
                              </FormDescription>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="0.05"
                                  className="neon-input bg-dark-card border-gray-600"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        {/* Minimum Deposit */}
                        <FormField
                          name="minDepositAmount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Minimum Deposit for Commission (₹)</FormLabel>
                              <FormDescription>
                                Minimum deposit amount required to earn commission
                              </FormDescription>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="50.00"
                                  className="neon-input bg-dark-card border-gray-600"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        {/* Max Commission */}
                        <FormField
                          name="maxCommissionPerRefer"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Maximum Commission per Referral (₹)</FormLabel>
                              <FormDescription>
                                Maximum total commission from single referral
                              </FormDescription>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="100.00"
                                  className="neon-input bg-dark-card border-gray-600"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        {/* Welcome Message */}
                        <FormField
                          name="referralWelcomeMessage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Referral Welcome Message</FormLabel>
                              <FormDescription>
                                Message shown to new users who join via referral
                              </FormDescription>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  rows={3}
                                  className="neon-input bg-dark-card border-gray-600"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        {/* Commission Description */}
                        <FormField
                          name="commissionDescription"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Commission Description</FormLabel>
                              <FormDescription>
                                Use {"{amount}"} and {"{deposit}"} as placeholders
                              </FormDescription>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  rows={2}
                                  className="neon-input bg-dark-card border-gray-600"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        {/* Terms and Conditions */}
                        <FormField
                          name="termsAndConditions"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Terms and Conditions</FormLabel>
                              <FormDescription>
                                Referral program terms shown to users
                              </FormDescription>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  rows={6}
                                  className="neon-input bg-dark-card border-gray-600"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <Button 
                          type="submit" 
                          className="w-full neo-button" 
                          disabled={updateSettingsMutation.isPending}
                        >
                          {updateSettingsMutation.isPending ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          Update Settings
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>

              {/* Preview */}
              <div className="space-y-6">
                <Card className="glass-card border-border/20">
                  <CardHeader>
                    <CardTitle className="gradient-text flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5" />
                      <span>Preview</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
                      <h4 className="font-semibold text-purple-400 mb-2">Commission Rate</h4>
                      <p className="text-2xl font-bold text-white">₹{form.watch("commissionRate")}</p>
                      <p className="text-sm text-gray-400">per ₹{form.watch("minDepositAmount")}+ deposit</p>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/20">
                      <h4 className="font-semibold text-yellow-400 mb-2">Welcome Message</h4>
                      <p className="text-sm text-gray-300">{form.watch("referralWelcomeMessage")}</p>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl border border-green-500/20">
                      <h4 className="font-semibold text-green-400 mb-2">Commission Description</h4>
                      <p className="text-sm text-gray-300">
                        {form.watch("commissionDescription")
                          .replace("{amount}", form.watch("commissionRate"))
                          .replace("{deposit}", form.watch("minDepositAmount"))}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-border/20">
                  <CardHeader>
                    <CardTitle className="gradient-text flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>Quick Stats</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Referrals</span>
                        <span className="text-white font-semibold">156</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Commission Paid</span>
                        <span className="text-green-400 font-semibold">₹2,340</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Active Users</span>
                        <span className="text-purple-400 font-semibold">89</span>
                      </div>
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