import { useState, useEffect } from "react";
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
  DollarSign,
  TrendingUp,
  RefreshCw,
  Wallet,
  Activity
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  categoryId: number;
  minQuantity: number;
  maxQuantity: number;
  isActive: boolean;
  providerId?: number;
}

interface Provider {
  id: number;
  name: string;
  apiUrl: string;
  balance?: number;
  currency?: string;
}

export default function AdminServiceManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [providerBalances, setProviderBalances] = useState<Record<number, any>>({});
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ["/api/admin/services"],
  });

  const { data: providers = [] } = useQuery({
    queryKey: ["/api/admin/providers"],
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
      toast({
        title: "Success",
        description: "Service updated successfully",
      });
    },
  });

  // Fetch provider balances
  const fetchProviderBalances = async () => {
    for (const provider of providers) {
      try {
        const balance = await apiRequest({
          url: `/api/admin/providers/${provider.id}/balance`,
          method: "GET"
        });
        setProviderBalances(prev => ({
          ...prev,
          [provider.id]: balance
        }));
      } catch (error) {
        console.error(`Failed to fetch balance for provider ${provider.id}:`, error);
      }
    }
  };

  useEffect(() => {
    if (providers.length > 0) {
      fetchProviderBalances();
    }
  }, [providers]);

  const filteredServices = services.filter((service: Service) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeServicesCount = services.filter((s: Service) => s.isActive).length;
  const totalRevenue = services.reduce((sum: number, s: Service) => sum + (s.price * 100), 0);

  const handleToggleService = (serviceId: number, isActive: boolean) => {
    updateServiceMutation.mutate({ serviceId, data: { isActive } });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Service Management
          </h1>
          <p className="text-muted-foreground">
            Quick service control and provider balances
          </p>
        </div>
        <Button onClick={fetchProviderBalances} className="neo-button w-fit">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Balances
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Services</p>
                <p className="text-2xl font-bold text-green-400">{activeServicesCount}</p>
              </div>
              <Eye className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Services</p>
                <p className="text-2xl font-bold text-blue-400">{services.length}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Price</p>
                <p className="text-2xl font-bold text-purple-400">
                  ₹{services.length > 0 ? (totalRevenue / services.length / 100).toFixed(2) : '0.00'}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Providers</p>
                <p className="text-2xl font-bold text-orange-400">{providers.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Provider Balances */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Provider Account Balances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {providers.map((provider: Provider) => (
              <div key={provider.id} className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{provider.name}</h3>
                  <Badge variant="outline" className="text-xs">
                    API Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Balance:</span>
                  <span className="font-bold text-lg">
                    {providerBalances[provider.id] ? (
                      `$${providerBalances[provider.id].balance}`
                    ) : (
                      <span className="text-yellow-400">Loading...</span>
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Services List - Optimized for Less Scrolling */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.slice(0, 20).map((service: Service) => (
          <Card key={service.id} className="glass-card hover:scale-105 transition-all">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm service-name truncate">
                    {service.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    ₹{service.price} | {service.minQuantity}-{service.maxQuantity}
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
              
              <div className="flex items-center justify-between text-xs">
                <Badge variant="secondary" className="text-xs">
                  {service.isActive ? "Visible" : "Hidden"}
                </Badge>
                {service.providerId && (
                  <Badge variant="outline" className="text-xs">
                    Auto Process
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredServices.length > 20 && (
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <p className="text-muted-foreground">
              Showing first 20 results. Use search to find specific services.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}