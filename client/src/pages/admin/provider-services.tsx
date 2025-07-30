import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Search, Download, CheckSquare, Square, Loader2 } from "lucide-react";

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

interface Provider {
  id: number;
  name: string;
  apiUrl: string;
  apiKey: string;
  isActive: boolean;
}

export default function ProviderServices() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const queryClient = useQueryClient();

  // Get providers
  const { data: providers = [] } = useQuery<Provider[]>({
    queryKey: ["/api/admin/providers"],
  });

  const activeProvider = providers.find(p => p.isActive);

  // Get provider services
  const { data: services = [], isLoading, refetch } = useQuery<ProviderService[]>({
    queryKey: ["/api/admin/provider-services", activeProvider?.id],
    enabled: !!activeProvider?.id,
  });

  // Import services mutation
  const importMutation = useMutation({
    mutationFn: async (data: { providerId: number; selectedServices: ProviderService[] }) => {
      const response = await apiRequest("POST", "/api/admin/services/import", data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Services Imported Successfully",
        description: `${data.imported} services imported successfully`,
      });
      setSelectedServices([]);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
    },
    onError: (error: any) => {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter services
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || 
                           service.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = Array.from(new Set(services.map(s => s.category))).sort();

  const handleSelectAll = () => {
    if (selectedServices.length === filteredServices.length) {
      setSelectedServices([]);
    } else {
      setSelectedServices(filteredServices.map(s => s.service));
    }
  };

  const handleSelectService = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleImport = async () => {
    if (!activeProvider || selectedServices.length === 0) return;
    
    setIsImporting(true);
    try {
      const selectedServiceData = services.filter(s => selectedServices.includes(s.service));
      await importMutation.mutateAsync({
        providerId: activeProvider.id,
        selectedServices: selectedServiceData
      });
    } finally {
      setIsImporting(false);
    }
  };

  if (!activeProvider) {
    return (
      <div className="container mx-auto p-4 lg:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg lg:text-xl">No Active Provider</CardTitle>
            <CardDescription className="text-sm lg:text-base">
              Please add and activate a provider first to manage services.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 lg:p-6 space-y-4 lg:space-y-6">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Provider Services</h1>
          <p className="text-gray-400 mt-2 text-sm lg:text-base">
            Import services from {activeProvider.name}
          </p>
        </div>
        
        <Button 
          onClick={() => refetch()}
          variant="outline"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Refresh Services
        </Button>
      </div>

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
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Selection Controls */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="w-full lg:w-auto"
              >
                {selectedServices.length === filteredServices.length ? (
                  <CheckSquare className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                Select All ({filteredServices.length})
              </Button>
              
              <span className="text-sm text-gray-400 text-center lg:text-left">
                {selectedServices.length} selected
              </span>
            </div>
            
            <Button
              onClick={handleImport}
              disabled={selectedServices.length === 0 || isImporting}
              className="neo-button w-full lg:w-auto"
            >
              {isImporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Import Selected ({selectedServices.length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Services List */}
      <div className="grid gap-4">
        {isLoading ? (
          <Card className="glass-card">
            <CardContent className="p-6 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading services...</p>
            </CardContent>
          </Card>
        ) : filteredServices.length === 0 ? (
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
                  <Checkbox
                    checked={selectedServices.includes(service.service)}
                    onCheckedChange={() => handleSelectService(service.service)}
                    className="mt-1 flex-shrink-0"
                  />
                  
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-sm lg:text-base line-clamp-2">{service.name}</h3>
                        <p className="text-xs lg:text-sm text-gray-400 break-all">ID: {service.service}</p>
                      </div>
                      
                      <div className="text-left lg:text-right flex-shrink-0">
                        <p className="font-bold text-green-400 text-sm lg:text-base">₹{parseFloat(service.rate).toFixed(4)}/1k</p>
                        <p className="text-xs text-gray-400">Base Rate</p>
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
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}