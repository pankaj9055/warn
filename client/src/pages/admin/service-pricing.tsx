import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Search, Save, Eye, EyeOff, Edit, Calculator } from "lucide-react";

interface Service {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  pricePerThousand: string;
  minQuantity: number;
  maxQuantity: number;
  isActive: boolean;
  providerId: number;
  providerServiceId: string;
  category?: {
    name: string;
    color: string;
  };
}

interface ServiceUpdate {
  id: number;
  isActive: boolean;
  pricePerThousand: string;
}

export default function ServicePricing() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [editingPrices, setEditingPrices] = useState<Record<number, string>>({});
  const [serviceUpdates, setServiceUpdates] = useState<Record<number, ServiceUpdate>>({});
  const queryClient = useQueryClient();

  // Get all services
  const { data: services = [], isLoading } = useQuery<Service[]>({
    queryKey: ["/api/admin/services"],
  });

  // Get service categories
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/services/categories"],
  });

  // Update services mutation
  const updateServicesMutation = useMutation({
    mutationFn: async (updates: ServiceUpdate[]) => {
      const response = await apiRequest("PUT", "/api/admin/services/bulk-update", { updates });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Services Updated",
        description: "Service visibility and pricing updated successfully",
      });
      setServiceUpdates({});
      setEditingPrices({});
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter services
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || 
                           service.categoryId.toString() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleVisibilityToggle = (serviceId: number, isActive: boolean) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    setServiceUpdates(prev => ({
      ...prev,
      [serviceId]: {
        id: serviceId,
        isActive,
        pricePerThousand: editingPrices[serviceId] || service.pricePerThousand
      }
    }));
  };

  const handlePriceEdit = (serviceId: number, price: string) => {
    setEditingPrices(prev => ({
      ...prev,
      [serviceId]: price
    }));

    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    setServiceUpdates(prev => ({
      ...prev,
      [serviceId]: {
        id: serviceId,
        isActive: serviceUpdates[serviceId]?.isActive ?? service.isActive,
        pricePerThousand: price
      }
    }));
  };

  const handleSaveChanges = () => {
    const updates = Object.values(serviceUpdates);
    if (updates.length === 0) {
      toast({
        title: "No Changes",
        description: "No changes to save",
        variant: "destructive",
      });
      return;
    }

    updateServicesMutation.mutate(updates);
  };

  const calculateProfit = (originalPrice: string, newPrice: string) => {
    const original = parseFloat(originalPrice);
    const updated = parseFloat(newPrice);
    if (isNaN(original) || isNaN(updated)) return "0%";
    
    const profit = ((updated - original) / original * 100).toFixed(1);
    return `${profit}%`;
  };

  const pendingChanges = Object.keys(serviceUpdates).length;

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="pt-20">
        <section className="py-8 px-4">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Service Management</h1>
                <p className="text-gray-400 mt-2 text-sm lg:text-base">
                  Control which services are visible to users and set custom pricing
                </p>
              </div>
              
              {pendingChanges > 0 && (
                <Button 
                  onClick={handleSaveChanges}
                  disabled={updateServicesMutation.isPending}
                  className="neo-button"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes ({pendingChanges})
                </Button>
              )}
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
                    {(categories as any[]).map((category: any) => (
                      <option key={category.id} value={category.id.toString()}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Services List */}
            <div className="grid gap-4">
              {isLoading ? (
                <Card className="glass-card">
                  <CardContent className="p-6 text-center">
                    <div className="animate-pulse">Loading services...</div>
                  </CardContent>
                </Card>
              ) : filteredServices.length === 0 ? (
                <Card className="glass-card">
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-400">No services found matching your criteria.</p>
                  </CardContent>
                </Card>
              ) : (
                filteredServices.map((service) => {
                  const isEditing = serviceUpdates[service.id];
                  const currentPrice = editingPrices[service.id] || service.pricePerThousand;
                  const isVisible = isEditing?.isActive ?? service.isActive;
                  const hasChanges = !!serviceUpdates[service.id];

                  return (
                    <Card key={service.id} className={`glass-card ${hasChanges ? 'border-purple-500/50' : ''}`}>
                      <CardContent className="p-4 lg:p-6">
                        <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                          {/* Visibility Toggle */}
                          <div className="flex items-center justify-between lg:justify-start lg:flex-col lg:items-center space-x-2 lg:space-x-0 lg:space-y-2 lg:mt-2">
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={isVisible}
                                onCheckedChange={(checked) => handleVisibilityToggle(service.id, checked)}
                                data-testid={`switch-visibility-${service.id}`}
                              />
                              {isVisible ? (
                                <Eye className="h-4 w-4 text-green-400" />
                              ) : (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 lg:hidden">
                              {hasChanges && (
                                <Badge variant="secondary" className="text-xs">
                                  Modified
                                </Badge>
                              )}
                              <Badge 
                                variant={isVisible ? "default" : "secondary"}
                                className={isVisible ? "bg-green-600" : "bg-gray-600"}
                              >
                                {isVisible ? "Visible" : "Hidden"}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex-1 space-y-3">
                            {/* Service Info */}
                            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-2">
                              <div className="flex-1">
                                <h3 className="font-semibold text-white text-sm lg:text-base line-clamp-2">{service.name}</h3>
                                <p className="text-xs lg:text-sm text-gray-400 break-all">
                                  ID: {service.providerServiceId}
                                </p>
                                <p className="text-xs text-gray-400">
                                  Min: {service.minQuantity} | Max: {service.maxQuantity}
                                </p>
                              </div>
                              
                              <div className="hidden lg:flex items-center gap-2">
                                {hasChanges && (
                                  <Badge variant="secondary" className="text-xs">
                                    Modified
                                  </Badge>
                                )}
                                <Badge 
                                  variant={isVisible ? "default" : "secondary"}
                                  className={isVisible ? "bg-green-600" : "bg-gray-600"}
                                >
                                  {isVisible ? "Visible" : "Hidden"}
                                </Badge>
                              </div>
                            </div>

                            {/* Description */}
                            {service.description && (
                              <p className="text-xs lg:text-sm text-gray-300 line-clamp-2">
                                {service.description}
                              </p>
                            )}

                            {/* Pricing Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 p-3 lg:p-4 bg-dark-card/50 rounded-lg">
                              <div>
                                <Label className="text-xs text-gray-400">Original Price (₹/1k)</Label>
                                <p className="text-sm font-medium text-gray-300">
                                  ₹{parseFloat(service.pricePerThousand).toFixed(2)}
                                </p>
                              </div>
                              
                              <div>
                                <Label className="text-xs text-gray-400">Your Price (₹/1k)</Label>
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={currentPrice}
                                    onChange={(e) => handlePriceEdit(service.id, e.target.value)}
                                    className="w-full lg:w-24 h-8 text-sm bg-dark-card border-gray-600"
                                    data-testid={`input-price-${service.id}`}
                                  />
                                  <Edit className="h-3 w-3 text-gray-400 hidden lg:block" />
                                </div>
                              </div>
                              
                              <div>
                                <Label className="text-xs text-gray-400">Profit Margin</Label>
                                <div className="flex items-center gap-1">
                                  <span className="text-sm font-medium text-green-400">
                                    {calculateProfit(service.pricePerThousand, currentPrice)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>

            {/* Summary */}
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex gap-4">
                    <span className="text-gray-400">
                      Total Services: {filteredServices.length}
                    </span>
                    <span className="text-green-400">
                      Visible: {filteredServices.filter(s => 
                        serviceUpdates[s.id]?.isActive ?? s.isActive
                      ).length}
                    </span>
                    <span className="text-gray-400">
                      Hidden: {filteredServices.filter(s => 
                        !(serviceUpdates[s.id]?.isActive ?? s.isActive)
                      ).length}
                    </span>
                  </div>
                  
                  {pendingChanges > 0 && (
                    <span className="text-purple-400">
                      {pendingChanges} pending changes
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}