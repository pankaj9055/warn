import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  ShoppingBag, 
  Plus, 
  Eye,
  EyeOff,
  DollarSign,
  Hash,
  TrendingUp,
  Filter,
  Search,
  Settings,
  RefreshCw,
  ExternalLink
} from "lucide-react";

const serviceConfigSchema = z.object({
  providerServiceId: z.string().min(1, "Provider service ID required"),
  customPrice: z.string().min(1, "Custom price required"),
  isActive: z.boolean(),
  categoryId: z.string().min(1, "Category required"),
  name: z.string().min(1, "Service name required"),
  description: z.string().optional(),
  minQuantity: z.number().min(1),
  maxQuantity: z.number().min(1),
});

export default function AdminProviderServices() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showActiveOnly, setShowActiveOnly] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch providers
  const { data: providers = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/providers"],
    enabled: !!user?.isAdmin,
  });

  // Fetch provider services from API
  const { data: providerServices = [], isLoading: loadingProviderServices } = useQuery<any[]>({
    queryKey: ["/api/admin/providers", selectedProvider, "services"],
    enabled: !!user?.isAdmin && !!selectedProvider,
  });

  // Fetch our configured services
  const { data: configuredServices = [] } = useQuery<any[]>({
    queryKey: ["/api/services"],
    enabled: !!user?.isAdmin,
  });

  // Fetch categories
  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ["/api/services/categories"],
    enabled: !!user?.isAdmin,
  });

  const form = useForm({
    resolver: zodResolver(serviceConfigSchema),
    defaultValues: {
      providerServiceId: "",
      customPrice: "",
      isActive: true,
      categoryId: "",
      name: "",
      description: "",
      minQuantity: 100,
      maxQuantity: 10000,
    },
  });

  const syncProviderServicesMutation = useMutation({
    mutationFn: (providerId: string) => apiRequest("POST", `/api/admin/providers/${providerId}/sync`),
    onSuccess: (data) => {
      toast({ 
        title: "Services Synced Successfully", 
        description: `Synced ${data.synced || 0} services from provider` 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/providers"] });
    },
    onError: () => {
      toast({ 
        title: "Sync Failed", 
        description: "Unable to sync services from provider",
        variant: "destructive" 
      });
    },
  });

  const addServiceMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/admin/services", data),
    onSuccess: () => {
      toast({ title: "Service added to panel successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      setDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ 
        title: "Failed to add service", 
        description: "Unable to add service to panel",
        variant: "destructive" 
      });
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest("PUT", `/api/admin/services/${id}`, data),
    onSuccess: () => {
      toast({ title: "Service updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      setDialogOpen(false);
      setEditingService(null);
      form.reset();
    },
    onError: () => {
      toast({ 
        title: "Update failed", 
        description: "Unable to update service",
        variant: "destructive" 
      });
    },
  });

  const toggleServiceMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) => 
      apiRequest("PUT", `/api/admin/services/${id}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
    },
  });

  const handleSubmit = (data: any) => {
    if (editingService) {
      updateServiceMutation.mutate({ id: editingService.id, data });
    } else {
      addServiceMutation.mutate({
        ...data,
        pricePerThousand: data.customPrice,
        providerServiceId: parseInt(data.providerServiceId),
      });
    }
  };

  const openEditDialog = (service: any) => {
    setEditingService(service);
    form.reset({
      providerServiceId: service.providerServiceId?.toString() || "",
      customPrice: service.pricePerThousand || "",
      isActive: service.isActive,
      categoryId: service.categoryId?.toString() || "",
      name: service.name || "",
      description: service.description || "",
      minQuantity: service.minQuantity || 100,
      maxQuantity: service.maxQuantity || 10000,
    });
    setDialogOpen(true);
  };

  const openAddDialog = (providerService: any) => {
    setEditingService(null);
    form.reset({
      providerServiceId: providerService.service.toString(),
      customPrice: (parseFloat(providerService.rate) * 1.2).toFixed(2), // 20% markup
      isActive: true,
      categoryId: categories.find(c => c.name.toLowerCase().includes(providerService.category.toLowerCase()))?.id?.toString() || "",
      name: providerService.name,
      description: providerService.description || `${providerService.name} - Provider: ${providerService.category}`,
      minQuantity: parseInt(providerService.min) || 100,
      maxQuantity: parseInt(providerService.max) || 10000,
    });
    setDialogOpen(true);
  };

  // Filter provider services
  const filteredProviderServices = providerServices.filter(service => {
    const matchesSearch = !searchTerm || 
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || 
      service.category.toLowerCase().includes(selectedCategory.toLowerCase());
    
    return matchesSearch && matchesCategory;
  });

  // Filter configured services
  const filteredConfiguredServices = configuredServices.filter(service => {
    const matchesSearch = !searchTerm || 
      service.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesActive = !showActiveOnly || service.isActive;
    
    return matchesSearch && matchesActive;
  });

  // Get unique categories from provider services
  const providerCategories = [...new Set(providerServices.map(s => s.category))];

  if (!user?.isAdmin) {
    return <div>Access denied</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Provider Services Management
          </h1>
          <p className="text-gray-400 mt-2">
            Sync services from providers, customize pricing, and manage your service offerings
          </p>
        </div>

        {/* Provider Selection */}
        <Card className="glass-card border-border/20 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ExternalLink className="mr-2 text-purple-400" size={20} />
              Provider Selection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center">
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger className="w-64 neon-input bg-dark-card border-gray-600">
                  <SelectValue placeholder="Select Provider" />
                </SelectTrigger>
                <SelectContent>
                  {providers.map((provider: any) => (
                    <SelectItem key={provider.id} value={provider.id.toString()}>
                      {provider.name} {provider.isActive ? '✓' : '✗'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedProvider && (
                <Button 
                  onClick={() => syncProviderServicesMutation.mutate(selectedProvider)}
                  disabled={syncProviderServicesMutation.isPending}
                  className="neo-button"
                >
                  <RefreshCw className="mr-2" size={16} />
                  {syncProviderServicesMutation.isPending ? "Syncing..." : "Sync Services"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="glass-card border-border/20 mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4 items-center flex-wrap">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    placeholder="Search services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 neon-input bg-dark-card border-gray-600"
                  />
                </div>
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48 neon-input bg-dark-card border-gray-600">
                  <SelectValue placeholder="Filter by Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {providerCategories.map((category: string) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center space-x-2">
                <Switch 
                  checked={showActiveOnly}
                  onCheckedChange={setShowActiveOnly}
                />
                <span className="text-sm text-gray-400">Active Only</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Provider Services */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <ShoppingBag className="mr-2 text-blue-400" size={20} />
              Provider Services ({filteredProviderServices.length})
            </h2>
            
            {loadingProviderServices ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
                <p className="text-gray-400 mt-2">Loading provider services...</p>
              </div>
            ) : !selectedProvider ? (
              <Card className="glass-card border-border/20">
                <CardContent className="pt-6 text-center py-12">
                  <ShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select a Provider</h3>
                  <p className="text-gray-400">Choose a provider to view their available services</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredProviderServices.map((service: any) => {
                  const isConfigured = configuredServices.some(cs => cs.providerServiceId === parseInt(service.service));
                  
                  return (
                    <Card key={service.service} className="glass-card border-border/20">
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-sm">{service.name}</h4>
                          <Badge variant={isConfigured ? "default" : "secondary"}>
                            {isConfigured ? "Added" : "Available"}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400 mb-2">{service.category}</p>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-green-400">₹{service.rate}/1k</span>
                          <div className="text-xs text-gray-500">
                            Min: {service.min} | Max: {service.max}
                          </div>
                        </div>
                        {!isConfigured && (
                          <Button 
                            size="sm" 
                            className="w-full mt-2 neo-button"
                            onClick={() => openAddDialog(service)}
                          >
                            <Plus size={14} className="mr-1" />
                            Add to Panel
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Configured Services */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Settings className="mr-2 text-purple-400" size={20} />
              Your Panel Services ({filteredConfiguredServices.length})
            </h2>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredConfiguredServices.map((service: any) => (
                <Card key={service.id} className="glass-card border-border/20">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm service-name">{service.name}</h4>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          checked={service.isActive}
                          onCheckedChange={(checked) => 
                            toggleServiceMutation.mutate({ id: service.id, isActive: checked })
                          }
                        />
                        {service.isActive ? (
                          <Eye size={14} className="text-green-400" />
                        ) : (
                          <EyeOff size={14} className="text-gray-400" />
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-purple-400">₹{service.pricePerThousand}/1k</span>
                      <span className="text-xs text-gray-500">
                        {service.minQuantity}-{service.maxQuantity}
                      </span>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="w-full border-gray-600"
                      onClick={() => openEditDialog(service)}
                    >
                      <Settings size={14} className="mr-1" />
                      Configure
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Service Configuration Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="glass-card border-border/20 max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingService ? "Edit Service" : "Add Service to Panel"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Name</FormLabel>
                      <FormControl>
                        <Input {...field} className="neon-input bg-dark-card border-gray-600" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="neon-input bg-dark-card border-gray-600">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category: any) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Price (₹ per 1000)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          step="0.01"
                          className="neon-input bg-dark-card border-gray-600" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="minQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Min Quantity</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number"
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            className="neon-input bg-dark-card border-gray-600" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Quantity</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number"
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
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
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Switch 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Service Active</FormLabel>
                    </FormItem>
                  )}
                />

                <div className="flex space-x-2 pt-4">
                  <Button 
                    type="submit" 
                    className="flex-1 neo-button"
                    disabled={addServiceMutation.isPending || updateServiceMutation.isPending}
                  >
                    {editingService ? "Update Service" : "Add Service"}
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
    </div>
  );
}