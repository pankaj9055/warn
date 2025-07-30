import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/navigation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Settings, Key, DollarSign, Globe } from "lucide-react";

const providerSchema = z.object({
  name: z.string().min(1, "Provider name is required"),
  apiUrl: z.string().url("Valid API URL is required"),
  apiKey: z.string().min(1, "API key is required"),
});

type ProviderForm = z.infer<typeof providerSchema>;

export default function AdminApiSettings() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('providers');

  const form = useForm<ProviderForm>({
    resolver: zodResolver(providerSchema),
    defaultValues: {
      name: "",
      apiUrl: "",
      apiKey: "",
    },
  });

  const { data: providers = [], isLoading: providersLoading } = useQuery({
    queryKey: ["/api/admin/providers"],
    enabled: !!user?.isAdmin,
  });

  const createProviderMutation = useMutation({
    mutationFn: (data: ProviderForm) => apiRequest("POST", "/api/admin/providers", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/providers"] });
      form.reset();
      toast({
        title: "Success",
        description: "Provider added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add provider",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProviderForm) => {
    createProviderMutation.mutate(data);
  };

  if (isLoading || !user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="pt-20 px-4">
        <div className="max-w-7xl mx-auto py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">
              <span className="gradient-text">API Settings</span>
            </h1>
            <p className="text-gray-400">Manage your SMM providers and payment gateways</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-2 mb-8">
            {[
              { id: 'providers', label: 'SMM Providers', icon: Globe },
              { id: 'payments', label: 'Payment Gateways', icon: DollarSign },
              { id: 'api', label: 'API Keys', icon: Key },
            ].map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant={activeTab === id ? "default" : "outline"}
                onClick={() => setActiveTab(id)}
                className={`neo-button rounded-xl ${
                  activeTab === id 
                    ? "bg-gradient-to-r from-purple-500 to-pink-500" 
                    : "glass-card"
                }`}
              >
                <Icon className="mr-2" size={16} />
                {label}
              </Button>
            ))}
          </div>

          {/* Providers Tab */}
          {activeTab === 'providers' && (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Add Provider Form */}
              <Card className="glass-card border-border/20">
                <CardHeader>
                  <CardTitle className="gradient-text">Add SMM Provider</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">Provider Name</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="e.g., SocialPanel, SMMHeaven"
                                className="neon-input bg-dark-card border-gray-600 text-white"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="apiUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">API URL</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="https://api.provider.com/v2"
                                className="neon-input bg-dark-card border-gray-600 text-white"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="apiKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">API Key</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="password"
                                placeholder="Your API key"
                                className="neon-input bg-dark-card border-gray-600 text-white"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        disabled={createProviderMutation.isPending}
                        className="w-full neo-button py-3 rounded-2xl text-white font-semibold"
                      >
                        {createProviderMutation.isPending ? "Adding..." : "Add Provider"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              {/* Existing Providers */}
              <Card className="glass-card border-border/20">
                <CardHeader>
                  <CardTitle className="gradient-text">Active Providers</CardTitle>
                </CardHeader>
                <CardContent>
                  {providersLoading ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner />
                    </div>
                  ) : providers.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No providers configured</p>
                  ) : (
                    <div className="space-y-4">
                      {providers.map((provider: any) => (
                        <div key={provider.id} className="bg-dark-card rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-white">{provider.name}</h3>
                              <p className="text-sm text-gray-400">{provider.apiUrl}</p>
                            </div>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" className="text-green-400 border-green-400/30">
                                Test
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-400 border-red-400/30">
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="glass-card border-border/20">
                <CardHeader>
                  <CardTitle className="gradient-text">Payment Gateways</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Stripe */}
                    <div className="bg-dark-card rounded-xl p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-white">Stripe</h3>
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                          Active
                        </span>
                      </div>
                      <div className="space-y-3">
                        <Input
                          placeholder="Stripe Public Key (pk_...)"
                          className="neon-input bg-dark-base border-gray-600 text-white"
                        />
                        <Input
                          type="password"
                          placeholder="Stripe Secret Key (sk_...)"
                          className="neon-input bg-dark-base border-gray-600 text-white"
                        />
                        <Button size="sm" className="neo-button rounded-xl">
                          Update Stripe
                        </Button>
                      </div>
                    </div>

                    {/* Razorpay */}
                    <div className="bg-dark-card rounded-xl p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-white">Razorpay</h3>
                        <span className="text-xs bg-gray-500/20 text-gray-400 px-2 py-1 rounded-full">
                          Inactive
                        </span>
                      </div>
                      <div className="space-y-3">
                        <Input
                          placeholder="Razorpay Key ID"
                          className="neon-input bg-dark-base border-gray-600 text-white"
                        />
                        <Input
                          type="password"
                          placeholder="Razorpay Secret"
                          className="neon-input bg-dark-base border-gray-600 text-white"
                        />
                        <Button size="sm" className="neo-button rounded-xl">
                          Enable Razorpay
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Settings */}
              <Card className="glass-card border-border/20">
                <CardHeader>
                  <CardTitle className="gradient-text">Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-2 block">
                        Minimum Deposit (₹)
                      </label>
                      <Input
                        type="number"
                        defaultValue="50"
                        className="neon-input bg-dark-card border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-2 block">
                        Referral Bonus (₹)
                      </label>
                      <Input
                        type="number"
                        defaultValue="10"
                        className="neon-input bg-dark-card border-gray-600 text-white"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Amount given to referrer when referred user deposits ₹50+
                      </p>
                    </div>
                    <Button className="neo-button rounded-xl">
                      Save Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* API Tab */}
          {activeTab === 'api' && (
            <Card className="glass-card border-border/20">
              <CardHeader>
                <CardTitle className="gradient-text">API Documentation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-dark-card rounded-xl p-4">
                    <h3 className="font-semibold text-white mb-2">Your API Key</h3>
                    <div className="flex items-center space-x-2">
                      <Input
                        value="sk_neonsmm_api_key_example_123456789"
                        readOnly
                        className="neon-input bg-dark-base border-gray-600 text-white"
                      />
                      <Button size="sm" className="neo-button rounded-xl">
                        Copy
                      </Button>
                    </div>
                  </div>

                  <div className="bg-dark-card rounded-xl p-4">
                    <h3 className="font-semibold text-white mb-4">API Endpoints</h3>
                    <div className="space-y-3 text-sm">
                      <div className="border-l-2 border-green-400 pl-3">
                        <code className="text-green-400">GET /api/services</code>
                        <p className="text-gray-400">Get all available services</p>
                      </div>
                      <div className="border-l-2 border-blue-400 pl-3">
                        <code className="text-blue-400">POST /api/orders</code>
                        <p className="text-gray-400">Create new order</p>
                      </div>
                      <div className="border-l-2 border-yellow-400 pl-3">
                        <code className="text-yellow-400">GET /api/orders/:id</code>
                        <p className="text-gray-400">Get order status</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}