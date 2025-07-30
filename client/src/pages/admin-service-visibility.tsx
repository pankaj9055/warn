import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Search,
  Eye,
  EyeOff,
  Settings,
  DollarSign,
  ShoppingBag
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Service {
  id: number;
  name: string;
  description: string | null;
  pricePerThousand: string;
  categoryId: number;
  minQuantity: number | null;
  maxQuantity: number | null;
  isActive: boolean | null;
  providerId: number | null;
  providerServiceId: string | null;
  createdAt: Date | null;
}

interface ServiceCategory {
  id: number;
  name: string;
  slug: string;
  icon: string;
  color: string;
  isActive: boolean | null;
}

export default function AdminServiceVisibility() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: categories = [] } = useQuery<ServiceCategory[]>({
    queryKey: ["/api/services/categories"],
  });

  const { data: services = [], isLoading } = useQuery<Service[]>({
    queryKey: ["/api/admin/services"],
  });

  const updateServiceMutation = useMutation({
    mutationFn: ({ serviceId, data }: { serviceId: number; data: any }) =>
      apiRequest({
        url: `/api/admin/services/${serviceId}`,
        method: "PUT",
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      toast({
        title: "Success",
        description: "Service updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update service",
        variant: "destructive",
      });
    },
  });

  // Filter services
  const filteredServices = services.filter((service: Service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (service.description || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || 
      categories.find((c: ServiceCategory) => c.id === service.categoryId)?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle individual service toggle
  const toggleService = (serviceId: number, isActive: boolean) => {
    updateServiceMutation.mutate({
      serviceId,
      data: { isActive }
    });
  };

  // Handle price update
  const updatePrice = (serviceId: number, newPrice: string) => {
    updateServiceMutation.mutate({
      serviceId,
      data: { pricePerThousand: newPrice }
    });
  };

  // Handle bulk actions
  const handleEnableAll = () => {
    filteredServices.forEach(service => {
      updateServiceMutation.mutate({
        serviceId: service.id,
        data: { isActive: true }
      });
    });
  };

  const handleDisableAll = () => {
    filteredServices.forEach(service => {
      updateServiceMutation.mutate({
        serviceId: service.id,
        data: { isActive: false }
      });
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="h-20 bg-purple-500/20 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Service Visibility Control
          </h1>
          <p className="text-muted-foreground">
            Control which services users can see and order
          </p>
        </div>
        <Badge variant="outline" className="w-fit">
          {services.filter((s: Service) => s.isActive).length} / {services.length} Services Active
        </Badge>
      </div>

      {/* Controls */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Category Filter */}
            <div className="sm:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="all">All Categories</option>
                {categories.map((category: ServiceCategory) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          <div className="flex gap-2 mt-4">
            <Button
              onClick={handleEnableAll}
              disabled={updateServiceMutation.isPending}
              variant="outline"
              size="sm"
            >
              <Eye className="w-4 h-4 mr-2" />
              Enable All
            </Button>
            <Button
              onClick={handleDisableAll}
              disabled={updateServiceMutation.isPending}
              variant="outline"
              size="sm"
            >
              <EyeOff className="w-4 h-4 mr-2" />
              Disable All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Services List */}
      <div className="space-y-3">
        {filteredServices.length > 0 ? (
          filteredServices.map((service: Service) => (
            <Card key={service.id} className="glass-card hover:scale-[1.01] transition-all">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  {/* Service Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate service-name">
                      {service.name}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {service.description || "No description"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        ID: {service.id}
                      </Badge>
                      <Badge variant={service.providerId ? "default" : "secondary"} className="text-xs">
                        {service.providerId ? "MySMM" : "Manual"}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {categories.find(c => c.id === service.categoryId)?.name || "Unknown"}
                      </Badge>
                    </div>
                  </div>

                  {/* Price Editor */}
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={service.pricePerThousand}
                      onChange={(e) => updatePrice(service.id, e.target.value)}
                      className="w-24 h-8 text-sm"
                      placeholder="Price"
                    />
                    <span className="text-xs text-muted-foreground">/1k</span>
                  </div>

                  {/* Blue Toggle Button - Main Feature */}
                  <div className="flex items-center gap-3">
                    <Label htmlFor={`service-${service.id}`} className="text-sm font-medium">
                      {service.isActive ? "ON" : "OFF"}
                    </Label>
                    <Switch
                      id={`service-${service.id}`}
                      checked={service.isActive || false}
                      onCheckedChange={(checked) => toggleService(service.id, checked)}
                      className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                    />
                  </div>

                  {/* Status */}
                  <Badge 
                    variant={service.isActive ? "default" : "secondary"}
                    className={service.isActive 
                      ? "bg-green-500 text-white" 
                      : "bg-red-500 text-white"
                    }
                  >
                    {service.isActive ? "Visible to Users" : "Hidden from Users"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="glass-card">
            <CardContent className="p-8 text-center">
              <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Services Found</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedCategory !== "all" 
                  ? "No services match your current filters."
                  : "No services available. Sync from MySMM provider first."
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Instructions */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            How to Use Service Visibility
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-blue-500 mb-2">Blue Toggle Controls:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Blue toggle ON = Service visible to users</li>
                <li>• Blue toggle OFF = Service hidden from users</li>
                <li>• Only enabled services appear on user service page</li>
                <li>• Users cannot order disabled services</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-green-500 mb-2">Price Editing:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Edit price to add your markup</li>
                <li>• Price is per 1000 quantity</li>
                <li>• Set higher prices to earn more profit</li>
                <li>• Changes apply immediately</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}