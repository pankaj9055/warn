import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Edit, 
  Trash2,
  Key,
  Globe,
  Settings,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  XCircle
} from "lucide-react";

const providerSchema = z.object({
  name: z.string().min(1, "Provider name is required"),
  apiUrl: z.string().url("Valid API URL is required"),
  apiKey: z.string().min(1, "API key is required"),
  isActive: z.boolean(),
  description: z.string().optional(),
});

// Sample provider configurations - remove after adding real providers
const sampleProviders = {
  "MySMM": {
    name: "MySMM",
    apiUrl: "https://mysmmapi.com/api/v2",
    description: "Popular SMM panel with extensive service catalog",
  },
  "SocialPanel": {
    name: "SocialPanel", 
    apiUrl: "https://socialpanel.com/api/v2",
    description: "Reliable SMM services provider",
  },
  "SMM Heaven": {
    name: "SMM Heaven",
    apiUrl: "https://smmheaven.com/api/v2", 
    description: "High-quality SMM services",
  }
};

export default function AdminProviders() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingProvider, setEditingProvider] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [testingConnection, setTestingConnection] = useState<number | null>(null);
  const [syncingServices, setSyncingServices] = useState<number | null>(null);

  const { data: providers = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/providers"],
    enabled: !!user?.isAdmin,
  });

  const form = useForm({
    resolver: zodResolver(providerSchema),
    defaultValues: {
      name: "",
      apiUrl: "",
      apiKey: "",
      isActive: true,
      description: "",
    },
  });

  const createProviderMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/admin/providers", data),
    onSuccess: () => {
      toast({ title: "Provider added successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/providers"] });
      form.reset();
      setDialogOpen(false);
      setEditingProvider(null);
    },
  });

  const updateProviderMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiRequest("PUT", `/api/admin/providers/${id}`, data),
    onSuccess: () => {
      toast({ title: "Provider updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/providers"] });
      setEditingProvider(null);
      setDialogOpen(false);
      form.reset();
    },
  });

  const deleteProviderMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/providers/${id}`),
    onSuccess: () => {
      toast({ title: "Provider deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/providers"] });
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: (id: number) => apiRequest("POST", `/api/admin/providers/${id}/test`),
    onSuccess: (data, variables) => {
      setTestingConnection(null);
      toast({ 
        title: "Connection Test Successful", 
        description: "Provider API is working correctly" 
      });
    },
    onError: (error, variables) => {
      setTestingConnection(null);
      toast({ 
        title: "Connection Test Failed", 
        description: "Unable to connect to provider API",
        variant: "destructive" 
      });
    },
  });

  const syncServicesMutation = useMutation({
    mutationFn: (id: number) => apiRequest("POST", `/api/admin/providers/${id}/sync`),
    onSuccess: (data, variables) => {
      setSyncingServices(null);
      toast({ 
        title: "Services Synced Successfully", 
        description: `Synced ${data.synced || 0} services from provider${data.errors?.length ? ` with ${data.errors.length} errors` : ''}` 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
    },
    onError: (error, variables) => {
      setSyncingServices(null);
      toast({ 
        title: "Service Sync Failed", 
        description: "Unable to sync services from provider",
        variant: "destructive" 
      });
    },
  });

  const onSubmit = (data: any) => {
    if (editingProvider) {
      updateProviderMutation.mutate({ id: editingProvider.id, data });
    } else {
      createProviderMutation.mutate(data);
    }
  };

  const startEdit = (provider: any) => {
    setEditingProvider(provider);
    form.reset({
      name: provider.name,
      apiUrl: provider.apiUrl,
      apiKey: provider.apiKey,
      isActive: provider.isActive,
      description: provider.description || "",
    });
    setDialogOpen(true);
  };

  const testConnection = (providerId: number) => {
    setTestingConnection(providerId);
    testConnectionMutation.mutate(providerId);
  };

  const syncServices = (providerId: number) => {
    setSyncingServices(providerId);
    syncServicesMutation.mutate(providerId);
  };

  if (!user?.isAdmin) return null;

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="pt-20">
        <section className="py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold gradient-text">Provider APIs</h1>
                <p className="text-gray-400">Manage external service providers for reselling</p>
              </div>
              
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="neo-button"
                    onClick={() => {
                      setEditingProvider(null);
                      form.reset();
                      setDialogOpen(true);
                    }}
                  >
                    <Plus size={16} className="mr-2" />
                    Add Provider
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card border-border/20 max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="gradient-text">
                      {editingProvider ? "Edit Provider" : "Add New Provider"}
                    </DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Provider Name</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="MySMM API"
                                  className="neon-input bg-dark-card border-gray-600"
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
                              <FormLabel>API URL</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="https://mysmmapi.com/api/v2"
                                  className="neon-input bg-dark-card border-gray-600"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="apiKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>API Key</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="password"
                                placeholder="Enter API key"
                                className="neon-input bg-dark-card border-gray-600"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Brief description of this provider"
                                className="neon-input bg-dark-card border-gray-600"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="isActive"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Switch 
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel>Provider Active</FormLabel>
                          </FormItem>
                        )}
                      />

                      <div className="flex space-x-2 pt-4">
                        <Button 
                          type="submit" 
                          className="flex-1 neo-button"
                          disabled={createProviderMutation.isPending || updateProviderMutation.isPending}
                        >
                          {editingProvider ? "Update Provider" : "Add Provider"}
                        </Button>
                        <Button 
                          type="button"
                          variant="outline"
                          onClick={() => setDialogOpen(false)}
                          className="border-gray-600"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Providers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isLoading ? (
                <div className="col-span-2 text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
                  <p className="text-gray-400 mt-2">Loading providers...</p>
                </div>
              ) : providers.length === 0 ? (
                <div className="col-span-2">
                  <Card className="glass-card border-border/20">
                    <CardContent className="pt-6">
                      <div className="text-center py-12">
                        <Key className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Providers Configured</h3>
                        <p className="text-gray-400 mb-4">Add your first provider to start reselling services</p>
                        <p className="text-sm text-gray-500">
                          Connect your provider APIs to automatically sync their services to your panel
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                providers.map((provider: any) => (
                  <Card key={provider.id} className="glass-card border-border/20">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg flex items-center">
                          <Globe className="mr-2 text-purple-400" size={20} />
                          {provider.name}
                        </CardTitle>
                        <Badge variant={provider.isActive ? "default" : "secondary"}>
                          {provider.isActive ? (
                            <>
                              <CheckCircle size={12} className="mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle size={12} className="mr-1" />
                              Inactive
                            </>
                          )}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-400 mb-1">API URL</p>
                          <div className="flex items-center space-x-2">
                            <code className="text-xs bg-dark-card px-2 py-1 rounded font-mono text-blue-400">
                              {provider.apiUrl}
                            </code>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => window.open(provider.apiUrl, '_blank')}
                              className="p-1 h-6 w-6"
                            >
                              <ExternalLink size={12} />
                            </Button>
                          </div>
                        </div>

                        {provider.description && (
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Description</p>
                            <p className="text-sm text-gray-300">{provider.description}</p>
                          </div>
                        )}

                        <div>
                          <p className="text-sm text-gray-400 mb-1">API Key</p>
                          <code className="text-xs bg-dark-card px-2 py-1 rounded font-mono text-green-400">
                            {provider.apiKey ? '••••••••••••••••' : 'Not set'}
                          </code>
                        </div>

                        <div className="flex space-x-2 pt-3">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => testConnection(provider.id)}
                            disabled={testingConnection === provider.id}
                            className="flex-1 border-green-500/30 text-green-400"
                          >
                            {testingConnection === provider.id ? (
                              <RefreshCw size={14} className="mr-1 animate-spin" />
                            ) : (
                              <CheckCircle size={14} className="mr-1" />
                            )}
                            Test
                          </Button>
                          
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => syncServices(provider.id)}
                            disabled={syncingServices === provider.id}
                            className="flex-1 border-blue-500/30 text-blue-400"
                          >
                            {syncingServices === provider.id ? (
                              <RefreshCw size={14} className="mr-1 animate-spin" />
                            ) : (
                              <RefreshCw size={14} className="mr-1" />
                            )}
                            Sync
                          </Button>

                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => startEdit(provider)}
                            className="border-orange-500/30 text-orange-400"
                          >
                            <Edit size={14} />
                          </Button>
                          
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${provider.name}?`)) {
                                deleteProviderMutation.mutate(provider.id);
                              }
                            }}
                            disabled={deleteProviderMutation.isPending}
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {providers.length > 0 && (
              <Card className="glass-card border-border/20 mt-8">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Settings className="mr-2" size={20} />
                    Provider Integration Guide
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm text-gray-400">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                      <div>
                        <strong className="text-gray-300">Test Connection:</strong> Verify that your API credentials are working
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                      <div>
                        <strong className="text-gray-300">Sync Services:</strong> Import available services from the provider
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                      <div>
                        <strong className="text-gray-300">Set Pricing:</strong> Configure your markup prices for each service
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}