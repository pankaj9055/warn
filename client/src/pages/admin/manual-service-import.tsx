import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
// Removed checkbox import - now using direct import buttons
import { toast } from "@/hooks/use-toast";
import { Search, Download, Loader2, RefreshCw, ExternalLink } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProviderService {
  service: string;
  name: string;
  category: string;
  rate: string;
  min: string;
  max: string;
  type: string;
  description?: string;
}

export default function ManualServiceImport() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [providerServices, setProviderServices] = useState<ProviderService[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  // Get all providers
  const { data: providers = [] } = useQuery({
    queryKey: ["/api/admin/providers"],
  });

  const activeProvider = selectedProvider 
    ? (providers as any[]).find((p: any) => p.id.toString() === selectedProvider)
    : (providers as any[]).find((p: any) => p.isActive);

  // Fetch provider services manually
  const fetchProviderServices = async (providerId?: string) => {
    const providerToUse = providerId ? providers.find((p: any) => p.id.toString() === providerId) : activeProvider;
    
    if (!providerToUse) {
      toast({
        title: "No Provider Selected",
        description: "Please select a provider first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest("GET", `/api/admin/provider-services/${providerToUse.id}`);
      if (response.ok) {
        const services = await response.json();
        setProviderServices(services);
        toast({
          title: "Services Loaded",
          description: `Loaded ${services.length} services from ${providerToUse.name}`,
        });
      } else {
        throw new Error("Failed to fetch services");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch provider services",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Import service immediately when selected
  const importService = async (service: ProviderService) => {
    try {
      const response = await apiRequest("POST", "/api/admin/services/import", {
        providerId: activeProvider.id,
        selectedServices: [service]
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      
      const data = await response.json();
      if (data.imported > 0) {
        toast({
          title: "Service Imported",
          description: `${service.name} imported successfully. Set pricing to enable it.`,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      } else if (data.errors.length > 0) {
        toast({
          title: "Import Info",
          description: data.errors[0],
          variant: "default",
        });
      }
    } catch (error: any) {
      toast({
        title: "Import Failed", 
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleImportService = (service: ProviderService) => {
    importService(service);
  };

  // Get unique categories
  const categories = Array.from(new Set(providerServices.map(s => s.category))).sort();

  // Filter services
  const filteredServices = providerServices.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!activeProvider) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="pt-20">
          <div className="container mx-auto p-4 lg:p-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg lg:text-xl">No Active Provider</CardTitle>
                <CardDescription className="text-sm lg:text-base">
                  Please add and activate a provider first to import services.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="pt-20">
        <section className="py-8 px-4">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Manual Service Import</h1>
                <p className="text-gray-400 mt-2 text-sm lg:text-base">
                  {activeProvider ? `Import services from ${activeProvider.name} manually` : 'Select a provider to import services'}
                </p>
              </div>
            </div>
            
            {/* Provider Selection */}
            <Card className="glass-card border-border/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ExternalLink className="mr-2 text-purple-400" size={20} />
                  Select Provider to Import From
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 items-center">
                  <Select value={selectedProvider} onValueChange={(value) => {
                    setSelectedProvider(value);
                    setProviderServices([]);
                  }}>
                    <SelectTrigger className="w-64 neon-input bg-dark-card border-gray-600">
                      <SelectValue placeholder="Choose Provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {(providers as any[]).map((provider: any) => (
                        <SelectItem key={provider.id} value={provider.id.toString()}>
                          {provider.name} {provider.isActive ? '✅ Active' : '⚪ Inactive'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {(selectedProvider || activeProvider) && (
                    <Button 
                      onClick={() => fetchProviderServices(selectedProvider)}
                      disabled={isLoading}
                      className="neo-button"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      Load Services
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {providerServices.length > 0 && (
              <>
                {/* Filters */}
                <Card className="glass-card">
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex flex-col gap-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search services..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 bg-dark-card border-gray-600 text-sm"
                        />
                      </div>
                      
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3 py-2 bg-dark-card border border-gray-600 rounded-md text-white text-sm"
                      >
                        <option value="all">All Categories ({providerServices.length})</option>
                        {categories.map(category => (
                          <option key={category} value={category}>
                            {category} ({providerServices.filter(s => s.category === category).length})
                          </option>
                        ))}
                      </select>
                    </div>
                  </CardContent>
                </Card>

                {/* Info Card */}
                <Card className="glass-card">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-400">
                        Click <span className="text-purple-400">"Add Now"</span> to import services directly. 
                        Imported services will be disabled by default - enable them in Service Pricing page.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Services List */}
                <div className="grid gap-4">
                  {filteredServices.length === 0 ? (
                    <Card className="glass-card">
                      <CardContent className="p-6 text-center">
                        <p className="text-gray-400">No services found matching your criteria.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    filteredServices.map((service) => (
                      <Card key={service.service} className="glass-card">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-1 space-y-2 min-w-0">
                              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-2">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-white text-sm lg:text-base line-clamp-2">{service.name}</h3>
                                  <p className="text-xs lg:text-sm text-gray-400 break-all">ID: {service.service}</p>
                                </div>
                                
                                <div className="text-left lg:text-right flex-shrink-0">
                                  <p className="font-bold text-green-400 text-sm lg:text-base">₹{parseFloat(service.rate).toFixed(4)}/1k</p>
                                  <p className="text-xs text-gray-400">Provider Rate</p>
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap gap-1 lg:gap-2">
                                <Badge variant="secondary" className="text-xs">{service.category}</Badge>
                                <Badge variant="outline" className="text-xs">Min: {service.min}</Badge>
                                <Badge variant="outline" className="text-xs">Max: {service.max}</Badge>
                                <Badge variant="outline" className="text-xs">{service.type}</Badge>
                              </div>
                              
                              {service.description && (
                                <p className="text-xs lg:text-sm text-gray-300 line-clamp-2">{service.description}</p>
                              )}
                              
                              <div className="pt-2">
                                <Button
                                  onClick={() => handleImportService(service)}
                                  className="neo-button w-full lg:w-auto"
                                  size="sm"
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Add Now
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>

                {/* Summary */}
                <Card className="glass-card">
                  <CardContent className="p-4">
                    <div className="text-center text-sm text-gray-400">
                      <p>
                        Services imported directly. Go to <span className="text-purple-400">Service Pricing</span> to set custom prices and enable them for users.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {providerServices.length === 0 && !isLoading && (
              <Card className="glass-card">
                <CardContent className="p-6 text-center">
                  <p className="text-gray-400 mb-4">Click "Load Services" to fetch services from {activeProvider.name}</p>
                  <Button onClick={fetchProviderServices} className="neo-button">
                    <Download className="h-4 w-4 mr-2" />
                    Load Services
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}