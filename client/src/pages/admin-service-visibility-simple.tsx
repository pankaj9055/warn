import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Search, Eye, EyeOff, CheckSquare, Square } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  categoryId: number;
  isActive: boolean;
}

export default function AdminServiceVisibilitySimple() {
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: services = [], isLoading } = useQuery({
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
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
    },
  });

  const filteredServices = services.filter((service: Service) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = services.filter((s: Service) => s.isActive).length;

  const handleToggleService = (serviceId: number, isActive: boolean) => {
    updateServiceMutation.mutate({ serviceId, data: { isActive } });
  };

  const handleEnableAll = async () => {
    try {
      const promises = services.map((service: Service) =>
        apiRequest({
          url: `/api/admin/services/${service.id}`,
          method: "PUT",
          body: { isActive: true }
        })
      );
      
      await Promise.all(promises);
      
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      
      toast({
        title: "Success",
        description: `All ${services.length} services enabled for users`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to enable all services",
        variant: "destructive",
      });
    }
  };

  const handleDisableAll = async () => {
    try {
      const promises = services.map((service: Service) =>
        apiRequest({
          url: `/api/admin/services/${service.id}`,
          method: "PUT",
          body: { isActive: false }
        })
      );
      
      await Promise.all(promises);
      
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      
      toast({
        title: "Success",
        description: `All ${services.length} services disabled for users`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disable all services",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="h-16 bg-purple-500/20 rounded-lg animate-pulse"></div>
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
          {activeCount} / {services.length} Services Active
        </Badge>
      </div>

      {/* Controls */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
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
            
            {/* Bulk Actions */}
            <div className="flex gap-2">
              <Button
                onClick={handleEnableAll}
                className="bg-green-600 hover:bg-green-700"
                disabled={updateServiceMutation.isPending}
              >
                <CheckSquare className="w-4 h-4 mr-2" />
                Enable All
              </Button>
              
              <Button
                onClick={handleDisableAll}
                variant="destructive"
                disabled={updateServiceMutation.isPending}
              >
                <Square className="w-4 h-4 mr-2" />
                Disable All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map((service: Service) => (
          <Card key={service.id} className="glass-card hover:scale-105 transition-all">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm service-name truncate">
                    {service.name}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {service.description}
                  </p>
                  <p className="text-sm font-semibold text-purple-400">
                    ₹{service.price}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 ml-2">
                  <Switch
                    checked={service.isActive}
                    onCheckedChange={(checked) => handleToggleService(service.id, checked)}
                    disabled={updateServiceMutation.isPending}
                  />
                  {service.isActive ? (
                    <Eye className="w-4 h-4 text-green-500" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Badge 
                  variant={service.isActive ? "default" : "secondary"}
                  className="text-xs"
                >
                  {service.isActive ? "Visible to Users" : "Hidden from Users"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <Card className="glass-card">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              {searchTerm ? "No services found matching your search." : "No services available."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}